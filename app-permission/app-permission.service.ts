import {
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { AdminModuleAccessLevel } from 'src/admin-module-access-level/entities/admin-module-access-level.entity';
import { RoleService } from 'src/role/role.service';
import { AdminUserCustomRolePermissionService } from 'src/admin-user-custom-role-permission/admin-user-custom-role-permission.service';
import { CreateDto } from 'src/admin-user-custom-role-permission/dto/create.dto';
import { DeleteDto } from 'src/admin-user-custom-role-permission/dto/delete.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { DeleteRolePermissionDto } from './dto/delete-role-permission.dto';
import { AdminPortalRuleService } from 'src/admin-portal-rule/admin-portal-rule.service';

@Injectable({ scope: Scope.REQUEST })
export class AppPermissionService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(AdminModuleAccessLevel)
    private amalRepository: Repository<AdminModuleAccessLevel>,
    private roleService: RoleService,
    private aucrPermissionService: AdminUserCustomRolePermissionService,
    private apRuleService: AdminPortalRuleService,
  ) {}

  /* Get All Permissions List */
  async getAllPermissions() {
    let records = await this.amalRepository.manager.query(
      `EXEC procGetAllPermissionsForAdminPortal`,
    );
    let data = [];
    await records.map(async (record: any) => {
      let item = {
        childId: record.accessLevelKey,
        label: record.accessLevel,
        expanded: true,
      };
      if (!data[record.id]) {
        data[record.id] = {
          label: record.moduleName,
          children: [],
        };
      }
      data[record.id].children.push(item);
    });
    let finalList = data.filter(function (item) {
      return item != null;
    });
    return finalList;
  }

  /* Get All User Permissions List */
  async getAllUserPermissions(id = null, nested = false) {
    const member = this.request.user;
    if (!id && member['id']) {
      id = member['id'];
    }
    let records = await this.amalRepository.manager.query(
      `EXEC procGetAdminPortalPermissionsByUser 
              @userId=@0, @roleId=@1`,
      [id, 0],
    );
    let data = [];
    if (nested) {
      await records.map(async (rec: any) => {
        let item = {
          label: rec.accessLevel,
          value: rec.accessLevelKey,
          expanded: true,
          checked: rec.isChecked ? true : false,
        };
        if (!data[rec.id]) {
          data[rec.id] = {
            label: rec.moduleName,
            value: rec.moduleName,
            checked: false,
            children: [],
          };
        }
        data[rec.id].children.push(item);
      });
      let finalList = data.filter(function (item) {
        return item != null;
      });
      await finalList.reduce(async (promise, rec) => {
        await promise;
        let actualChildren = rec.children;
        let checkedChild = await rec.children.filter(
          (childRec) => childRec.checked == true,
        );
        rec.value = actualChildren;
        if (actualChildren.length == checkedChild.length) {
          rec.checked = true;
        }
        return rec;
      }, Promise.resolve());
      return finalList;
    }
    await records.map(async (rec: any) => {
      if (rec.isChecked) {
        let item = {
          label: rec.accessLevel,
          value: rec.accessLevelKey,
        };
        data.push(item);
      }
    });
    return data;
  }

  /* Get Role Permissions List */
  async getRolePermissions(roleId: string) {
    const record = await this.roleService.findOneByRoleUuid(roleId);
    let records = await this.amalRepository.manager.query(
      `EXEC procGetPermissionsByAdminPortalRole 
            @roleId=@0`,
      [record.RoleId],
    );

    let data = [];
    await records.map(async (rec: any) => {
      let item = {
        label: rec.accessLevel,
        value: rec.accessLevelKey,
        expanded: true,
        checked: rec.isChecked ? true : false,
      };
      if (!data[rec.id]) {
        data[rec.id] = {
          label: rec.moduleName,
          value: rec.moduleName,
          checked: false,
          children: [],
        };
      }
      data[rec.id].children.push(item);
    });
    let finalList = data.filter(function (item) {
      return item != null;
    });
    await finalList.reduce(async (promise, rec) => {
      await promise;
      let actualChildren = rec.children;
      let checkedChild = await rec.children.filter(
        (childRec) => childRec.checked == true,
      );
      rec.value = actualChildren;
      if (actualChildren.length == checkedChild.length) {
        rec.checked = true;
      }
      return rec;
    }, Promise.resolve());
    return finalList;
  }

  /* Update Role Permissions List */
  async updateRolePermissions(
    roleId: string,
    updateDto: UpdateRolePermissionDto,
  ) {
    const member = this.request.user;
    const record = await this.roleService.findUserRoleByRoleUuid(roleId);
    let permissions = [];
    if (!updateDto.permissions.length) {
      throw new UnprocessableEntityException('Permissions not found!');
    }
    permissions = updateDto.permissions;
    //Check all input keys exist in the tblAdminModuleAccessLevel - Client Data validation
    let records = await this.amalRepository.manager.query(
      `EXEC procGetAdminPortalPermissionsByKeys 
            @permissionKeys=@0`,
      [permissions.join()],
    );
    //Counts Not equeal, which means some Error!
    if (records == null || records.length != permissions.length) {
      throw new UnprocessableEntityException('Permission not found!');
    }
    //Check records exist for the roleId in table tblAdminPortalRule
    let existingPermissionsRecords = await this.amalRepository.manager.query(
      `EXEC procGetPermissionsByAdminPortalRole 
            @roleId=@0`,
      [record.RoleId],
    );
    const existingPermissions = await existingPermissionsRecords.filter(
      (res) => res.isChecked == 1,
    );
    if (existingPermissions == null || existingPermissions.length == 0) {
      //Get Ids from tblAdminModuleAccessLevel using inputKey insert it against roleId
      await records.reduce(async (promise, rec) => {
        await promise;
        let create = new CreateRolePermissionDto();
        create.roleId = record.RoleId;
        create.adminModuleAccessLevelId = rec.id;
        create.createdBy = member['id'];
        await this.apRuleService.create(create);
      }, Promise.resolve());
    } else {
      // Exist!
      let existingList = [];
      await existingPermissions.reduce(async (promise, rec) => {
        await promise;
        existingList.push(rec.accessLevelKey);
      }, Promise.resolve());
      //Delete
      let deleteMissing = existingList.filter(
        (item) => permissions.indexOf(item) < 0,
      );
      //Insert
      let insertMissing = permissions.filter(
        (item) => existingList.indexOf(item) < 0,
      );
      if (deleteMissing.length) {
        //Delete
        let deleteRecs = await this.amalRepository.manager.query(
          `EXEC procGetAdminPortalPermissionsByKeys 
                    @permissionKeys=@0`,
          [deleteMissing.join()],
        );
        await deleteRecs.reduce(async (promise, delRec) => {
          await promise;
          let deleteRecObj = new DeleteRolePermissionDto();
          deleteRecObj.roleId = record.RoleId;
          deleteRecObj.adminModuleAccessLevelId = delRec.id;
          await this.apRuleService.delete(deleteRecObj);
        }, Promise.resolve());
      }
      if (insertMissing.length) {
        //Insert
        let insertRecs = await this.amalRepository.manager.query(
          `EXEC procGetAdminPortalPermissionsByKeys 
                    @permissionKeys=@0`,
          [insertMissing.join()],
        );
        await insertRecs.reduce(async (promise, insertRec) => {
          await promise;
          let insertRecObj = new CreateRolePermissionDto();
          insertRecObj.roleId = record.RoleId;
          insertRecObj.adminModuleAccessLevelId = insertRec.id;
          insertRecObj.createdBy = member['id'];
          await this.apRuleService.create(insertRecObj);
        }, Promise.resolve());
      }
    }
    let finalData = await this.amalRepository.manager.query(
      `EXEC procGetPermissionsByAdminPortalRole 
            @roleId=@0`,
      [record.RoleId],
    );
    return finalData;
  }

  /* Save User CustomRole Permissions */
  async saveUserCustomRolePermissions(memberId, roleId, permissions = []) {
    const loggedInUser = this.request.user;
    //Method will be used when User role is Custom Only
    if (!permissions.length) {
      throw new UnprocessableEntityException('Permissions not found!');
    }
    //Check all input keys exist in the tblAdminModuleAccessLevel - Client Data validation
    let records = await this.amalRepository.manager.query(
      `EXEC procGetAdminPortalPermissionsByKeys 
            @permissionKeys=@0`,
      [permissions.join()],
    );
    //Counts Not equeal, which means some Error!
    if (records == null || records.length != permissions.length) {
      throw new UnprocessableEntityException('Permission not found!');
    }
    //Check records exist for the memberId in table tblAdminUserCustomRolePermission
    let existingPermissionsRecords = await this.amalRepository.manager.query(
      `EXEC procGetAdminPortalPermissionsByUser 
            @userId=@0, @roleId=@1`,
      [memberId, roleId],
    );
    const existingPermissions = await existingPermissionsRecords.filter(
      (res) => res.isChecked == 1,
    );
    if (existingPermissions == null || existingPermissions.length == 0) {
      //Get Ids from tblAdminModuleAccessLevel using inputKey insert it against memberId
      await records.reduce(async (promise, rec) => {
        await promise;
        let create = new CreateDto();
        create.memberId = memberId;
        create.adminModuleAccessLevelId = rec.id;
        create.createdBy = loggedInUser['id'];
        await this.aucrPermissionService.create(create);
      }, Promise.resolve());
    } else {
      // Exist!
      let existingList = [];
      await existingPermissions.reduce(async (promise, rec) => {
        await promise;
        existingList.push(rec.accessLevelKey);
      }, Promise.resolve());
      //Delete
      let deleteMissing = existingList.filter(
        (item) => permissions.indexOf(item) < 0,
      );
      //Insert
      let insertMissing = permissions.filter(
        (item) => existingList.indexOf(item) < 0,
      );
      if (deleteMissing.length) {
        //Delete
        let deleteRecs = await this.amalRepository.manager.query(
          `EXEC procGetAdminPortalPermissionsByKeys 
                    @permissionKeys=@0`,
          [deleteMissing.join()],
        );
        await deleteRecs.reduce(async (promise, delRec) => {
          await promise;
          let deleteRecObj = new DeleteDto();
          deleteRecObj.memberId = memberId;
          deleteRecObj.adminModuleAccessLevelId = delRec.id;
          await this.aucrPermissionService.delete(deleteRecObj);
        }, Promise.resolve());
      }
      if (insertMissing.length) {
        //Insert
        let insertRecs = await this.amalRepository.manager.query(
          `EXEC procGetAdminPortalPermissionsByKeys 
                    @permissionKeys=@0`,
          [insertMissing.join()],
        );
        await insertRecs.reduce(async (promise, insertRec) => {
          await promise;
          let insertRecObj = new CreateDto();
          insertRecObj.memberId = memberId;
          insertRecObj.adminModuleAccessLevelId = insertRec.id;
          insertRecObj.createdBy = loggedInUser['id'];
          await this.aucrPermissionService.create(insertRecObj);
        }, Promise.resolve());
      }
    }
    let finalData = await this.amalRepository.manager.query(
      `EXEC procGetAdminPortalPermissionsByUser 
            @userId=@0, @roleId=@1`,
      [memberId, roleId],
    );
    return finalData;
  }

  /* Clean Custom Role Permissions For a User*/
  async clearCustomPermissions(userId: number) {
    let records = await this.amalRepository.manager.query(
      `EXEC procClearCustomRolePermissions 
            @userId=@0`,
      [userId],
    );
    return records;
  }
}

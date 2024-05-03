import {
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { InjectRepository, getRepositoryToken } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Request } from 'express';
import { AppPermissionService } from 'src/app-permission/app-permission.service';
import { ExcelService } from 'src/excel/excel.service';
import { CreateMemberAddressDto } from 'src/member-address/dto/create-member-address.dto';
import { UpdateMemberAddressDto } from 'src/member-address/dto/update-member-address.dto';
import { MemberAddressService } from 'src/member-address/member-address.service';
import { CreateMemberDto } from 'src/members/dto/create-member.dto';
import { Member } from 'src/members/entities/member.entity';
import { RoleService } from 'src/role/role.service';
import { StatusEnum } from 'src/statuses/statuses.enum';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Repository, getRepository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUsersDto } from './dto/search-users';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Member)
    private userRepository: Repository<Member>,
    private readonly configService: ConfigService,
    private readonly roleService: RoleService,
    private readonly memberAddressService: MemberAddressService,
    private readonly permissionService: AppPermissionService,
    private readonly excelService: ExcelService,
  ) { }
  /* Get User Data */
  async getUserByUuid(memberUuid: string) {
    const record = await this.userRepository.findOne({
      memberuuid: memberUuid,
    });
    if (!record) {
      throw new UnprocessableEntityException('User not exist!');
    }
    return record;
  }
  /* Check Email Exists */
  async isEmailExist(email: string) {
    email = email.toLowerCase();
    const record = await this.userRepository.findOne({
      email: email,
    });
    if (record) {
      throw new UnprocessableEntityException('Email already in use!');
    }
    return false;
  }
  /* Get All Users */
  async getAllUsers(searchOptionsDto: SearchUsersDto) {
    let entities = await this.userRepository.manager.query(
      `EXEC procGetAdminUsers 
                      @page=@0,
                      @size=@1,
                      @sortBy=@2,
                      @sortOrder=@3`,
      [
        searchOptionsDto.page,
        searchOptionsDto.limit,
        searchOptionsDto.sortBy,
        searchOptionsDto.order,
      ],
    );
    const records = await entities.filter((res) => res.filterType == 'record');
    const countRecord = await entities.filter(
      (res) => res.filterType == 'total',
    );
    const pageMetaDto = new PageMetaDto({
      itemCount: countRecord[0].totalRecords,
      pageOptionsDto: searchOptionsDto,
    });
    return new PageDto(records, pageMetaDto);
  }
  /* Create User */
  async create(createDto: CreateMemberDto) {
    const loggedInUser = this.request.user;
    createDto.createdBy = loggedInUser['id'];
    let user = await this.userRepository.save(
      this.userRepository.create(createDto),
    );

    let addressData = new CreateMemberAddressDto();
    addressData.createdBy = loggedInUser['id'];
    addressData.countryId = createDto.countryId;
    if (createDto.stateId) {
      addressData.stateId = createDto.stateId ? createDto.stateId : null;
    }
    await this.memberAddressService.create(user, addressData);
    return user;
  }
  /* Add User */
  async addUser(createUserDto: CreateUserDto) {
    //Check Role Exist
    let roleRecord = await this.roleService.findOneByRoleUuid(
      createUserDto.roleId,
    );
    //Check If Role IS CUSTOM
    if (roleRecord.RoleId == this.configService.get('app.customRole')) {
      if (!createUserDto.permissions.length) {
        throw new UnprocessableEntityException('Permissions not found!');
      }
    }
    /*Generate Hash*/
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    let user = await this.create({
      fullName: createUserDto.fullName,
      email: createUserDto.email,
      password: createUserDto.password,
      countryId: createUserDto.countryId,
      stateId: createUserDto.stateId,
      roleId: roleRecord.Id,
      hash,
    });
    let userRecord = await this.userRepository.findOne(user.id);
    userRecord.statusId = StatusEnum.active;
    userRecord.isActive = true;
    await userRecord.save();
    //Check If Role IS CUSTOM
    if (roleRecord.RoleId == this.configService.get('app.customRole')) {
      await this.permissionService.saveUserCustomRolePermissions(
        user.id,
        roleRecord.RoleId,
        createUserDto.permissions,
      );
    }
    let searchOptionsDto = new SearchUsersDto();
    return this.getAllUsers(searchOptionsDto);
  }
  /* Get User */
  async getUser(userId: string) {
    //Check user exist
    let userRecord = await this.getUserByUuid(userId);

    let user = await this.userRepository.manager.query(
      `EXEC procGetUserData 
      @userId=@0`,
      [userRecord.id],
    );
    if (!user.length) {
      throw new UnprocessableEntityException('User not exist!');
    }
    let permissions = await this.permissionService.getAllUserPermissions(
      userRecord.id,
      true,
    );
    let data = {
      ...user[0],
      permissions,
    };
    return data;
  }

  /* Update User */
  async updateUser(userId: string, updateUser: UpdateUserDto) {
    const loggedInUser = this.request.user;
    //Check user exist
    let userRecord = await this.getUserByUuid(userId);
    let user = await this.userRepository.manager.query(
      `EXEC procGetUserData 
      @userId=@0`,
      [userRecord.id],
    );
    if (!user.length) {
      throw new UnprocessableEntityException('User not exist!');
    }
    //Check email exist!
    if (userRecord.email != updateUser.email) {
      await this.isEmailExist(updateUser.email);
    }
    //Check Role Exist
    let roleRecord = await this.roleService.findOneByRoleUuid(
      updateUser.roleId,
    );
    let userRoleData = await this.roleService.getUserRole(userRecord.id);
    //Check If Role IS CUSTOM
    if (roleRecord.RoleId == this.configService.get('app.customRole')) {
      if (!updateUser.permissions.length) {
        throw new UnprocessableEntityException('Permissions not found!');
      }
      await this.permissionService.saveUserCustomRolePermissions(
        userRecord.id,
        roleRecord.RoleId,
        updateUser.permissions,
      );
    }
    /*
     * Remove If any Permissions for CUSTOM if role has changed from custom to
     * Admin, Developer, DataAudit, Marketing
     */
    if (
      userRoleData.roleId == this.configService.get('app.customRole') &&
      roleRecord.RoleId != this.configService.get('app.customRole')
    ) {
      //Clean
      await this.permissionService.clearCustomPermissions(userRecord.id);
    }
    //Update User
    if (updateUser.isResetPassword === true) {
      if (!updateUser.password) {
        throw new UnprocessableEntityException('Please should not be empty!');
      }
      if (updateUser.password.length < 7 && updateUser.password.length > 20) {
        throw new UnprocessableEntityException(
          'Password must be minimum of eight characters and maximum of twenty characters!',
        );
      }
      await this.userRepository.save(
        this.userRepository.create({
          id: userRecord.id,
          fullName: updateUser.fullName,
          email: updateUser.email,
          password: updateUser.password,
          roleId: roleRecord.Id,
          modifiedOn: new Date(),
          modifiedBy: loggedInUser['id'],
        }),
      );
    } else {
      await this.userRepository.save(
        this.userRepository.create({
          id: userRecord.id,
          fullName: updateUser.fullName,
          email: updateUser.email,
          roleId: roleRecord.Id,
          modifiedOn: new Date(),
          modifiedBy: loggedInUser['id'],
        }),
      );
    }
    //Update Address
    let memAddress = new UpdateMemberAddressDto();
    memAddress.countryId = updateUser.countryId;
    memAddress.stateId = updateUser.stateId;
    memAddress.modifiedBy = loggedInUser['id'];
    await this.memberAddressService.update(userRecord, memAddress);
    let searchOptionsDto = new SearchUsersDto();
    return this.getAllUsers(searchOptionsDto);
  }
  /* Delete User */
  async deleteUser(userId: string) {
    const loggedInUser = this.request.user;
    //Check user exist
    let userRecord = await this.getUserByUuid(userId);

    let user = await this.userRepository.manager.query(
      `EXEC procGetUserData 
      @userId=@0`,
      [userRecord.id],
    );
    if (!user.length) {
      throw new UnprocessableEntityException('User not exist!');
    }
    //Remove Permissions, if exist any
    //await this.permissionService.clearCustomPermissions(userRecord.id)
    //Remove address
    //await this.memberAddressService.delete(userRecord)
    //Remove User
    await this.userRepository.update(
      { memberuuid: userId },
      {
        isArchived: true,
        modifiedBy: loggedInUser['id'],
        modifiedOn: new Date(),
      },
    );
    let searchOptionsDto = new SearchUsersDto();
    return this.getAllUsers(searchOptionsDto);
  }
  /* Download Admin Users */
  async downloadAll() {
    let result = await this.userRepository.manager.query(
      `EXEC procGetAdminUsersDownload`,
    );
    if (result.length) {
      let headerList = [];
      let headersData = Object.keys(result[0]);
      await headersData.reduce(async (promise, item) => {
        await promise;
        item;
        let itemObj = {
          header: item,
          key: item,
          width: 30,
        };
        headerList.push(itemObj);
      }, Promise.resolve());
      let file = await this.excelService.generateReport(
        `Report`,
        headerList,
        result,
      );
      return file;
    } else {
      throw new NotFoundException('Data not found!');
    }
  }
  async updateActive(id:string ,status:boolean) {
    const loggedInUser = this.request.user;
      await getRepository(Member).update({memberuuid: id},
        {
        isActive:status,
        modifiedOn: new Date(),
        modifiedBy: loggedInUser['id']   
    } )
   let userRecord = await this.getUserByUuid(id);
   return userRecord
  }
}

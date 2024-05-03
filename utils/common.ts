export function CommonPromotionsStatus() {
  let statusList = [
    {
      id: 0,
      name: 'All',
    },
    {
      id: 1,
      name: 'Promoted',
    },
    {
      id: 2,
      name: 'Non-Promoted',
    },
  ];
  return statusList;
}

export function CommonFeeStatus() {
  let statusList = [
    {
      id: 0,
      name: 'All',
    },
    {
      id: 1,
      name: 'Farm Update',
    },
    {
      id: 2,
      name: 'Internal Update',
    },
    {
      id: 3,
      name: 'External Update',
    },
  ];
  return statusList;
}
export function CommonFeeStatusList() {
  let statusList = [
    {
      id: 0,
      name: 'Public',
    },
    {
      id: 1,
      name: 'Private',
    },
  ];
  return statusList;
}

export function getRequiresApprovalSystemActivityList() {
  let statusList = [' - requires verification', ' - needs verification'];
  return statusList;
}

export function getResponseObjectFromEnum(resource) {
  let result = [];
  Object.keys(resource).map(function (key, Index) {
    result.push({
      id: key,
      name: resource[key],
    });
  });
  return result;
}

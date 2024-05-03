export enum NotificationsStatus {
  UNREAD = 'Unread',
  READ = 'Read',
}
export enum MessagingSort {
  ALL = 'All Messages',
  UNREAD = 'Unread',
  READ = 'Read',
  DELETE = 'Delete',
}
export enum LatestMessagLimit {
  LIMIT = 2,
}

export enum MessagesStatus {
  READ = 'Read',
  UNREAD = 'Unread',
  PENDING = 'Pending',
  DELETED = 'Deleted',
}

export enum NominationStatus {
  PENDING = 'Pending',
  COUNTERED = 'Countered',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

export enum Origin {
  FARM = 'Farm Page',
  STALLION = 'Stallion Page',
  LBOOST = 'Local Boost',
  EXBOOST = 'Extended Boost',
  DIRECT = 'Direct Message',
  SEARCHPAGE = 'Search Page',
  SEARCHPAGE2020 = 'Search Page - 20/20',
  SEARCHPAGEPM = 'Search Page - Perfect Match',
}

export enum MessagesSortBy {
  CREATEDDATE = 'Date',
  FROM = 'From',
  TO = 'To',
  SUBJECT = 'Subject',
  NOMSTATUS = 'Nom Status',
  STATUS = 'Status',
}

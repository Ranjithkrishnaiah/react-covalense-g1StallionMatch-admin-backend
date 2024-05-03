import { UnprocessableEntityException } from '@nestjs/common';
import { extname, join } from 'path';

export const editFileName = (req, file, callback) => {
  // return `${Date.now()}.${extname(file.originalname)}`;
  /* const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = Array(4)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join(''); */
  callback(null, `${Date.now()}${extname(file.originalname)}`);
};

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(
      new UnprocessableEntityException('Only image files are allowed!'),
      false,
    );
  }
  callback(null, true);
};

export const pdfFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(pdf)$/)) {
    return callback(new Error('Only PDF files are allowed!'), false);
  }
  callback(null, true);
};

export const pdfFileName = (req, file, callback) => {
  //const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  callback(null, `${Date.now()}${extname(file.originalname)}`);
};

export const pdfOriginalName = (req, file, callback) => {
  //const name = file.originalname.split('.')[0];
  // const fileExtName = extname(file.originalname);
  callback(null, file.originalname);
};

export const getPdfFile = () => {
  //const name = file.originalname.split('.')[0];
  const filePath = join(__dirname, '..', '..', 'src/uploads/Report_Overview/');
  return filePath;
};

export const csvFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(csv)$/)) {
    return callback(new Error('Only CSV files are allowed!'), false);
  }
  callback(null, true);
};
export const csvFileName = (req, file, callback) => {
  //const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  callback(null, `${Date.now()}${extname(file.originalname)}`);
};

export const getCSVFile = () => {
  //const name = file.originalname.split('.')[0];
  const filePath = join(__dirname, '..', '..', 'src/uploads/sales-lot/');
  return filePath;
};

import * as yup from 'yup';

export const badgeValidationSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .max(255, 'Title must be at most 255 characters'),
  description: yup
    .string()
    .required('Description is required')
    .max(1000, 'Description must be at most 1000 characters'),
  image: yup
    .mixed()
    .required('Image is required')
    .test('fileType', 'The Uploaded file type is not supported.', (value) => {
      if (!value) {
        return false;
      }
      if (typeof value === 'string') {
        return true;
      }
      return value instanceof File && value.type.startsWith('image/');
    }),
});

export const certificateValidationSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .max(255, 'Title must be at most 255 characters'),
  description: yup
    .string()
    .required('Description is required')
    .max(1000, 'Description must be at most 1000 characters'),
  certificate_type: yup
    .string()
    .required('Certificate type is required'),
  image: yup
    .mixed()
    .required('Image is required')
    .test('fileType', 'The Uploaded file type is not supported.', (value) => {
      if (!value) {
        return false;
      }
      if (typeof value === 'string') {
        return true;
      }
      return value instanceof File && value.type.startsWith('image/');
    }),
});

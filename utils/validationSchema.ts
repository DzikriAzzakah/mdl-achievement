import * as yup from 'yup';

// Validation schema for audio add/edit
export const audioValidationSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .max(255, 'Title must be at most 255 characters'),
  description: yup
    .string()
    .required('Description is required'),
  audioContent: yup
    .mixed()
    .required('Audio file is required')
    .test('fileType', 'The Uploaded file type is not supported.', (value) => {
      if (!value) {
        return false;
      }
      if (typeof value === 'string') {
        return true;
      }
      return value instanceof File && value.type.startsWith('audio/');
    }),
  thumbnail: yup
    .mixed()
    .required('Thumbnail image is required')
    .test('fileType', 'The Uploaded file type is not supported.', (value) => {
      if (!value) {
        return false;
      }
      if (typeof value === 'string') {
        return true;
      }
      return value instanceof File && value.type.startsWith('image/');
    }),
  status_enum: yup.string().notRequired(),
  is_master: yup.boolean().notRequired(),
});

// Validation schema for playlist add/edit
export const playlistValidationSchema = yup.object().shape({
  playlistTitle: yup
    .string()
    .required('Title is required')
    .max(255, 'Title must be at most 255 characters'),
});

// Validation schema for landing section add/edit
export const landingSectionValidationSchema = yup.object().shape({
  sectionTitle: yup
    .string()
    .required('Title is required')
    .max(255, 'Title must be at most 255 characters'),
});

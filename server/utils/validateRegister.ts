import { UsernamePasswordInput } from '../resolvers/UsernamePasswordInput';

export const validateRegister = async (options: UsernamePasswordInput) => {
  if (!options.email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'invalid Email',
      },
    ];
  }
  if (options.username.length <= 3) {
    return [
      {
        field: 'username',
        message: 'length must be grater than 3',
      },
    ];
  }
  if (options.username.includes('@')) {
    return [
      {
        field: 'username',
        message: 'cannot include @-Sign',
      },
    ];
  }
  if (options.password.length <= 3) {
    return [
      {
        field: 'password',
        message: 'length must be grater than 3',
      },
    ];
  }
  return null;
};

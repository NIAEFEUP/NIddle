import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import { User } from '../../users/user.entity';

export default setSeederFactory(User, () => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const user = new User();
  user.name = `${firstName} ${lastName}`;
  user.email = faker.internet.email({ firstName, lastName }).toLowerCase();
  user.password =
    '$2b$10$P9Yw69qozktXNFTSbAUvOeVTaeCoPhY3dft1b3/wQHa7XPyKo6AlC'; // Password#123

  return user;
});

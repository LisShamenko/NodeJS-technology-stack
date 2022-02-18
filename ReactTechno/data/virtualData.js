import faker from "faker";

// создать фиктивные данные при помощи пакета faker
const virtualData = [...Array(50)].map(() => ({
    name: faker.name.findName(),
    email: faker.internet.email(),
    image: faker.internet.avatar()
}));

// 
export default virtualData;
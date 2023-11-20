const axios = require('axios');

run();

async function run() {

    for (let i = 0; i < 500; i++) {
        let user = `lhmkhang_${i}`,
            fullName = `Le Hoang Minh Khang ${i}`,
            lineManager = `Nguyen Thi Diep ${i}`,
            location = `HCM`,
            prize = `200K`;


        const response = await axios.post('http://10.1.23.167:8090/api/v1/check-reward', { prizeName: "200K", user, fullName, lineManager, location, prize });
        console.log(`Request thứ ${i}`);
    }

}
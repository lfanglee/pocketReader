import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';

/* <remove trigger="prod"> */
import {
    test
} from '../../lib/api-mock';
/* </remove> */

/* <jdists trigger="prod">
import { test } from '../../lib/api';
</jdists> */

Page({
    data: {
        answer: 3
        // answer: test(1, 2)
    },
    async onLoad() {
        const result = await test(1, 2);
        console.log(result);
    }
});

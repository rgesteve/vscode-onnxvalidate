//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
//var assert = require('assert');
import * as vscode from 'vscode';

import { dockerManager } from '../extension/dockerManager';
import { doesNotReject } from 'assert';


// Defines a Mocha test suite to group tests of similar kind together

suite("Docker running", () => {

    test("Something 1", () => {

        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));

    });

    test('getContainerType should revolve', async () => {
        try {
            await dockerManager.getContainerType().then((containerType: string) => {
                assert.equal(containerType, "linux")
            });
        } catch (e) {
            assert.fail("getContainerType didnt resolve");
        }

    });

    test('getImageID should revolve', async () => {
        try {
            await dockerManager.getImageId().then((imageID: string) => {
                assert.notEqual(imageID, "")
            });
        } catch (e) {
            assert.fail("getImageID didnt resolve ");
        }

    });

    test('Convert returns resolved promise', () => {

        // const convertParams: Map<string, string> = new Map<string, string>();
        // // set up all the required parameters
        // return dockerManager.convert(convertParams)
        //     .then(() => assert.(false), () => assert(true));


    });

    test("Promise example", () => {

        return Promise.resolve(1).then((x) => {
            assert.equal(x, 1);


        });

    });
});




// suite("Extension Tests Negative", function () {

//     suiteSetup(() => {
//         console.log('No workspace defined and no docker running')

//       })
//     test("Something 1", () => {
//         assert.equal(-1, [1, 2, 3].indexOf(5));
//         assert.equal(-1, [1, 2, 3].indexOf(0));
//     });

//     test('Convert returns rejected promise', () => {
//         const convertParams: Map<string, string> = new Map<string, string>();
//         return dockerManager.convert(convertParams)
//         .then(() => assert(false), () => assert(true));
//       });

//      test("Promise example", () => {
//         return Promise.resolve(1).then((x) => {
//             assert.equal(x, 1);
//         });
//     });
// });

// teardown( () => {

//         console.log("Mocha done")

//   });
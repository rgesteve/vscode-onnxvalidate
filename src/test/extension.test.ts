//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as vscode from 'vscode';

import { dockerManager } from '../extension/dockerManager';
import * as utils from '../extension/osUtils';
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
// Defines a Mocha test suite to group tests of similar kind together


var runningContainerId = "";
var mountLocation: string | undefined;
suite("Positive tests while docker running", () => {
    test('Get mount location', async () => {
        mountLocation = utils.getMountLocation();
        assert.equal(mountLocation, "c:\\Users\\Chanchala\\test_workspace");
    });

    test('getContainerType should revolve', async () => {
        try {
            await dockerManager.getContainerType().then((containerType: string) => {
                assert.equal(containerType, "linux")
            });
        } catch (e) {
            assert.fail("getContainerType did not resolve");
        }
    });

    test('getImageID should revolve', async () => {
        try {
            await dockerManager.getImageId().then((imageID: string) => {
                assert.notEqual(imageID, "");
            });
        } catch (e) {
            assert.fail("getImageID did not resolve ");
        }
    });


    test('runImage should revolve', async () => {
        try {
            await dockerManager.runImage().then((containerId: string) => {
                runningContainerId = containerId;
                assert.notEqual(containerId, "")
            });
        } catch (e) {
            assert.fail("runImage did not resolve ");
        }
    });

    test('Convert returns resolved promise', async () => {
        const convertParams: Map<string, string> = new Map<string, string>();
        if (mountLocation) {
            convertParams.set("input", path.join(mountLocation, "final_models", "resnet50", "resnet50_v1.pb"));
            try {
                await dockerManager.convert(convertParams).then(() => {
                    if (mountLocation && !fs.existsSync(path.join(mountLocation, "final_models", "resnet50", "resnet50_v1.onnx"))) {
                        assert.fail("Converted file does not exist ");
                    }
                });
            } catch (e) {
                assert.fail("Conversion failed");
            }
        }



    });

    test('Quantization of ONNX models with ONNXRuntime without dataset returns resolved promise', async () => {
        const quantizationParams: Map<string, string> = new Map<string, string>();
        if (mountLocation) {
            quantizationParams.set("model_path", path.join(mountLocation, "final_models", "resnet50", "resnet50_v1.onnx"));
            try {
                await dockerManager.quantizeModel(quantizationParams).then(() => {
                    if (mountLocation && !fs.existsSync(path.join(mountLocation, "final_models", "resnet50", "quantized_resnet50_v1.onnx"))) {
                        assert.fail("quantized file does not exist ");
                    }
                });
            } catch (e) {
                assert.fail("Quantization failed");
            }
        }

    });

    test('Quantization of TF models with Tensoflow without dataset returns resolved promise', async () => {
        const quantizationParams: Map<string, string> = new Map<string, string>();

        if (mountLocation) {
            quantizationParams.set("model_path", path.join(mountLocation, "final_models", "resnet50", "resnet50_v1.pb"));
            try {
                await dockerManager.quantizeModel(quantizationParams).then(() => {
                    if (mountLocation && !fs.existsSync(path.join(mountLocation, "final_models", "resnet50", "resnet50_v1_quantized.pb"))) {
                        assert.fail("quantized file does not exist ");
                    }
                });
            } catch (e) {
                assert.fail("Quantization failed");
            }
        }
    });
    test('Validation returns resolved promise', async () => {
        const mlperfParam: Map<string, string> = new Map<string, string>();

        if (mountLocation) {
            mlperfParam.set("model", path.join(mountLocation, "final_models", "resnet50", "resnet50_v1.pb"));
            mlperfParam.set("profile", "resnet50-tf");
            mlperfParam.set("backend", "tensorflow");
            mlperfParam.set("data-format", "NHWC");
            mlperfParam.set("count", "10");
            mlperfParam.set("dataset-path", path.join(mountLocation, "representative_dataset"));
            try {
                await dockerManager.validation(mlperfParam).then(() => {
                    if (!fs.existsSync(path.join(os.tmpdir(), "MLPerf", "results.json"))) {
                        assert.fail("Result file does not exist");
                    }
                });
            } catch (e) {
                assert.fail("Validation did not resolve");
            }
        }

    });
});


suite("Docker exec tests", () => {
    test('Docker stop container', async () => {
        try {
            await dockerManager.exeCmd("docker", ["stop", `${runningContainerId}`]).then(() => {
                assert.ok("Docker stop work");
            });
        } catch (e) {
            assert.fail("Docker exeCmd to stop container did not work");
        }
    });
});


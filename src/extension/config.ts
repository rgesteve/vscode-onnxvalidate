// Configs for the supported models
export const supported_models : { [key: string]: {inputs: string, outputs: string}} = {
    // resnet
    "resnet50": {
        "inputs": "input_tensor:0",
        "outputs" : "ArgMax:0",
    },
    // mobilenet
    "mobilenet": {
        "inputs": "input:0",
        "outputs": "MobilenetV1/Predictions/Reshape_1:0",
    },
}

// Configs for the docker container run
export const docker_images : { [key: string]: {}} = {
    "windows-onnxruntime": {
        "name": "onnxruntime:latest",
        "memory" : "",
        "cpu": ""
    },
    "linux-onnxruntime": {
        "name": "onnxruntime:latest",
        "memory" : "",
        "cpu": ""
    },
    "windows-mlperf": {
        "name": "mlperf:latest",
        "memory" : "",
        "cpu": ""
    },
    "linux-mlperf": {
        "name": "mlperf:latest",
        "memory" : "",
        "cpu": ""
    },
}

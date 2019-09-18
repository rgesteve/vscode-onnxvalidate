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
export const docker_images : { [key: string]: {name: string, memory: string, cpu: string}} = {
    "windows-onnxruntime": {
        "name": "onnxruntime_win:latest",
        "memory" : "",
        "cpu": ""
    },
    "linux-onnxruntime": {
        "name": "onnxruntime_linux:latest",
        "memory" : "",
        "cpu": ""
    },
    "windows-mlperf": {
        "name": "mlperf_win:latest",
        "memory" : "",
        "cpu": ""
    },
    "linux-mlperf": {
        "name": "chanchala7/mlperf_linux:latest",
        "memory" : "",
        "cpu": ""
    },
}

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

// Configs for tensorflow binaries
export const tensorflow_binaries : { [key: string]: {transform: string, summarize: string, benchmark: string}} = {
    "linux" : {
        "transform": "/root/tensorflow/bazel-bin/tensorflow/tools/graph_transforms/transform_graph",
        "summarize": "/root/tensorflow/bazel-bin/tensorflow/tools/graph_transforms/summarize_graph",
        "benchmark" : ""
    },
    "windows" : {
        "transform": "C:\\tensorflow\\bazel-bin\\tensorflow\\tools\\graph_transforms\\transform_graph",
        "summarize": "C:\\tensorflow\\bazel-bin\\tensorflow\\tools\\graph_transforms\\summarize_graph",
        "benchmark" : ""
    }
}

export const tensorflow_quantization_options : string  = 
    'add_default_attributes \
     strip_unused_nodes(type=float, shape="1,224,224,3") \
     remove_nodes(op=Identity, op=CheckNumerics) \
     fold_constants(ignore_errors=true) \
     fold_batch_norms \
     fold_old_batch_norms \
     quantize_weights \
     quantize_nodes \
     strip_unused_nodes' ;


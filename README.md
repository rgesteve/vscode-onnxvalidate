This is the README for the DL Toolkit extension. 
## Features
This extension enables you to
</br>
1.    Convert (Tensorflow models to ONNX models)
      *  Uses [tf2onnx](https://github.com/onnx/tensorflow-onnx/tree/master/tf2onnx) converter tool.
      *  For resnet50 and mobilenet models the input and output nodes are considered to be [this](https://github.com/rgesteve/vscode-onnxvalidate/blob/master/src/extension/config.ts#L2). If the input/output nodes need to be different, they can be changed using the input/output node in the Convert UI
      * For other models with unknown input and output nodes, the "Summarize Graph" can be used to get the details of the model. The summarize graph uses the [summarize_tool](https://github.com/tensorflow/tensorflow/blob/master/tensorflow/tools/graph_transforms/summarize_graph_main.cc) from tensorflow.
2. Quantize (Tensoflow and ONNX FP32 models to Int8 models)
    *  Both tensorflow models and ONNX models can be quantized
    *  Tensorflow models are quantized using [graph_transform](https://github.com/tensorflow/tensorflow/tree/master/tensorflow/tools/graph_transforms#using-the-graph-transform-tool) tool from tensorflow. The quantization options currently used are [these](https://github.com/rgesteve/vscode-onnxvalidate/blob/master/src/extension/config.ts#L76). WIP for adding a way to change the quantization options by user from the UI.
    *  Onnx models are quantized using the [quantization](https://github.com/microsoft/onnxruntime/tree/askhade/quantization_and_caliberation/onnxruntime/python/tools/quantization) scripts from onnxruntime. It supports dynamic quantization with Integer ops and QLinear ops. 
       * If no representative dataset is chosen, then a dynamic quantization with Integer ops is carried out
       * If a representative dataset is choosen with a preprocessing method, then, that dataset is preprocessed using the preprocessing method and then a dynamic quantization of the QLinear ops is carried out. Available preprocessing methods are `preprocess_method1` and `preprocess_method2`...[put more data about the preprocessing methods available (to be put in when the feature branch is merged into master)]. A preprocessed protobuf input with a count of the number of images can also be used if you have a preprocessed protobuf image.
   
3. Validate the models using MLPerf.
     *  Validation is done using MLPerf [v0.5](https://github.com/mlperf/inference/tree/master/v0.5/classification_and_detection)

## Requirements
1. Requires docker cli 
    *  The extension relies on a docker image which has the required runtimes and the scripts/tools to do the required work. That image is pulled to the host system at the start of the extension, if it doesnt already find the image on the host system
    *  When the docker image is run, 2 locations are mounted, so that data can be shared between the container and host machine.
    *  All the models, representative dataset that the application developer has needs to be accessible to the container via mount points. So, the extension user can specify this mount location via `dl-toolkit.mountLocation` location or if it is not specified then the mount location is considered to be the open workspace in VSCode. If both of them are not specified then the extension will give an error when `Initialize ecosystem` command is invoked.

## Extension Settings
1. Once the extension is installed, VSCode user [settings](https://code.visualstudio.com/docs/getstarted/settings) `dl-toolkit.mountLocation` can be used to set the mount location of the docker container. `dl-toolkit.memory` can be used to set the amount of memory while running the docker container
2. If `dl-toolkit.mountLocation` is not set, then the workspace that is currently open is used as the mount location. If this is not set either, then the extension will fail to `Initialize ecosystem`
3. If `dl-toolkit.memory` is not set, docker default is used to start the container

## Commands
1. `DL-Toolkit: Initialize ecosystem` needs to be run first, it will check the pre-requisites and fail if some of them is not satisfied. `DLToolkitChannel` in the `Output` window can be used to see the logs in real time. The logs are also stored in the OS' temp folder. [Describe this more...]
2. `DL-Toolkit: Reinitialize` should be use to reinitialize the ecosystem, if the initialization failed, after resolving the issues (if any) that `Initialize ecosystem` had.
3. `DL-Toolkit: Start ecosystem` starts the ecosystem by running the docker image.
4. `DL-Toolkit: Convert, Quantize, Validate` opens up the webview which allows the user to convert, quantize and validate the models.
5. Closing the instance of the VSCode will stop the docker container.
## Known Issues
1. The extension needs to be initialized, then the ecosystem should be started and then the webview commands can be executed. If the ecosystem isnt started, then the webview commands will return an error which would say that there are no running containers.

## Release Notes
1. With multiple instances of VSCode, with this extension activated on all of those instances, each instance will start a container. Each containers will be stopped when the corresponding VSCode instance which started the container is closed.
2. This extension is supported only on windows and linux hosts and the containers which are run on both these OSs are Linux containers. Support for windows container for inference is coming up.

### 0.0.4
Version 0.0.4


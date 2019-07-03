This vscode extension attempts to provide a unified view of many of the tools available to manipulate, adapt, verify and improve Deep Learning (DL) models, especially pre-trained models, in the process of preparing them to use within an application.

## Features

* Model conversion: TF->onnx supported right now, other formats in the works
* Model validation: Given a labeled dataset, this extension will run the model over it and verify that the results correspon with the label (or to what extent the results correspond with the label)
* Performance: We report running time per inference broken down per operator
* Model quantization (WIP)

## Requirements

* Docker: for the moment, we only include Windows containers, but the design is OS-agnostic
* A (software) project with a ML/DL model, either in TensorFlow "saved_model.pb" format or [onnx](https://onnx.ai)

## Extension Settings

None for the moment

## Known Issues

* No help handling errors in conversion/quantization ... we need to at the very least present them in a way that is obvious to the user.

## Release Notes

(No releases yet)


import { IDropdownOption, DropdownMenuItemType } from 'office-ui-fabric-react/lib/Dropdown';

export const MLPERF_TERMS = {
    "Single-stream" : "Evaluates real-world scenarios such as a smartphone user taking a picture. For the test run, LoadGen sends an initial query then continually sends the next query as soon as the previous query is processed. The metric is the 90th percentile latency (the latency such that 90% of queries complete at least that fast).",
    "Multi-stream" : "Evaluates real-world scenario such as a multi-camera automotive system that detects obstacles. The LoadGen uses multiple test runs to determine the maximum number of streams the system can support while meeting the latency constraint. The metric is the number of streams supported.",
    "qps" : "Query per second",
    "took" : "Total time taken",
    "good_items" : "This is TODO",
    "accuracy" : "This is TODO",
    "command" : "Command executed with params",
    "count" : "total count TODo"
}

    //TODO: Add other models as needed (takes care of resnet 50 and mobilenet)
export const Profileoptions: IDropdownOption[] = [
        { key: 'Resnet50Header', text: 'Resnet50', itemType: DropdownMenuItemType.Header },
        { key: 'resnet50-tf', text: 'resnet50-tf' },
        { key: 'resnet50-onnxruntime', text: 'resnet50-onnxruntime' },
        { key: 'divider_2', text: '-', itemType: DropdownMenuItemType.Divider },
        { key: 'MobilenetHeader', text: 'MobileNet', itemType: DropdownMenuItemType.Header },
        { key: 'mobilenet-tf', text: 'mobilenet-tf' },
        { key: 'mobilenet-onnxruntime', text: 'mobilenet-onnxruntime' }
    ];

    //TODO: Add other backends as needed
export const Backendoptions: IDropdownOption[] = [
        { key: 'tensorflow', text: 'tensorflow' },
        { key: 'onnxruntime', text: 'onnxruntime' },
    ];

    //TODO: Add other formats as needed
export const DataFormatoptions: IDropdownOption[] = [
        { key: 'NHWC', text: 'NHWC' },
        { key: 'NCHW', text: 'NCHW' },
    ];
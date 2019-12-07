import React, { Component } from 'react';
import { Text,Stack, IStackStyles, IStackItemStyles, IStackTokens, PrimaryButton, mergeStyles, mergeStyleSets, DefaultPalette, ScrollablePane } from 'office-ui-fabric-react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { getId } from 'office-ui-fabric-react/lib/Utilities';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { MLPERF_TERMS } from '../constants/Constants'
import Header from './Header';
import { Result } from './ValidationHelper';

interface IVResultProps {
    resultJSON: Result;
    downloadHandler: (event: React.MouseEvent<HTMLButtonElement>) => void
}

interface ISummarizeResultProps {
    summarizeResult: string;
}

class ValidationResult extends Component<IVResultProps, {}> {

    constructor(props: IVResultProps) {
        super(props);
    }

    render() {
        let result_instance = this.props.resultJSON;

        return (
            <Stack verticalFill gap='15'>
                <Stack.Item>
                    <Header name={"MLPERF Validation Results"} />
                </Stack.Item>

                <Stack.Item>
                    <Stack styles={stackStyles} tokens={customSpacingStackTokens} >

                        <Stack styles={stackItems} horizontal gap='5'>
                            <Stack.Item grow className={stackItemLabelStyles}>Accuracy
                                <TooltipHost content={MLPERF_TERMS.accuracy} styles={{ root: { display: 'inline-block' } }} id={getToolTipID(1)} calloutProps={{ gapSpace: 0 }}>
                                    <span style={{ cursor: 'pointer' }}><FontAwesomeIcon icon={faInfoCircle} size="xs" /></span>
                                </TooltipHost>
                            </Stack.Item>
                            <Stack.Item className={stackItemValueStyles}>{result_instance["TestScenario.SingleStream"].accuracy}</Stack.Item>
                        </Stack>

                        <Stack styles={stackItems} horizontal gap='5'>
                            <Stack.Item grow className={stackItemLabelStyles}>Good Items
                                <TooltipHost content={MLPERF_TERMS.good_items} styles={{ root: { display: 'inline-block' } }} id={getToolTipID(2)} calloutProps={{ gapSpace: 0 }}>
                                    <span style={{ cursor: 'pointer' }}><FontAwesomeIcon icon={faInfoCircle} size="xs" /></span>
                                </TooltipHost>
                            </Stack.Item>
                            <Stack.Item className={stackItemValueStyles}>{result_instance["TestScenario.SingleStream"].good_items}</Stack.Item>
                        </Stack>

                        <Stack styles={stackItems} horizontal gap='5'>
                            <Stack.Item grow className={stackItemLabelStyles}>Count
                                <TooltipHost content={MLPERF_TERMS.count} styles={{ root: { display: 'inline-block' } }} id={getToolTipID(3)} calloutProps={{ gapSpace: 0 }}>
                                    <span style={{ cursor: 'pointer' }}><FontAwesomeIcon icon={faInfoCircle} size="xs" /></span>
                                </TooltipHost>
                            </Stack.Item>
                            <Stack.Item className={stackItemValueStyles}>{result_instance["TestScenario.SingleStream"].count}</Stack.Item>
                        </Stack>

                        <Stack styles={stackItems} horizontal gap='5'>
                            <Stack.Item grow className={stackItemLabelStyles}>QPS
                                <TooltipHost content={MLPERF_TERMS.qps} styles={{ root: { display: 'inline-block' } }} id={getToolTipID(4)} calloutProps={{ gapSpace: 0 }}>
                                    <span style={{ cursor: 'pointer' }}><FontAwesomeIcon icon={faInfoCircle} size="xs" /></span>
                                </TooltipHost>
                            </Stack.Item>
                            <Stack.Item className={stackItemValueStyles}>{roundFloatValue(result_instance["TestScenario.SingleStream"].qps)}</Stack.Item>
                        </Stack>

                        <Stack styles={stackItems} horizontal gap='5'>
                            <Stack.Item grow className={stackItemLabelStyles}>Execution Time
                                <TooltipHost content={MLPERF_TERMS.took} styles={{ root: { display: 'inline-block' } }} id={getToolTipID(5)} calloutProps={{ gapSpace: 0 }}>
                                    <span style={{ cursor: 'pointer' }}><FontAwesomeIcon icon={faInfoCircle} size="xs" /></span>
                                </TooltipHost>
                            </Stack.Item>
                            <Stack.Item className={stackItemValueStyles}>{roundFloatValue(result_instance["TestScenario.SingleStream"].took) + 's'}</Stack.Item>
                        </Stack>

                        <Stack styles={customScrollStack} horizontal gap='5'>
                            <Stack.Item grow className={stackItemLabelStyles}>Command Executed
                                <TooltipHost content={MLPERF_TERMS.command} styles={{ root: { display: 'inline-block' } }} id={getToolTipID(6)} calloutProps={{ gapSpace: 0 }}>
                                    <span style={{ cursor: 'pointer' }}><FontAwesomeIcon icon={faInfoCircle} size="xs" /></span>
                                </TooltipHost>
                            </Stack.Item>
                            <Stack.Item className={stackItemValueStyles}>
                                <div className={classNames.wrapper}>
                                    <ScrollablePane styles={{ root: classNames.pane }}>
                                        <div className={classNames.textContent}>{result_instance.cmdline}</div>
                                    </ScrollablePane>
                                </div>
                            </Stack.Item>
                        </Stack>
                    </Stack>
                </Stack.Item>

                <Stack.Item>
                    <PrimaryButton style={{ width: '200px', display: 'flex' }} onClick={this.props.downloadHandler}>Download Test Result</PrimaryButton>
                </Stack.Item>

            </Stack>
        );
    }
};

export class SummarizeResult extends Component<ISummarizeResultProps, {}> {
    constructor(props: ISummarizeResultProps) {
        super(props);
    }
    render() {
        let result_instance = this.props.summarizeResult;
        return (
            <Stack tokens={containerStackTokens}>
                <Stack.Item grow styles={stackItemStyles}>
                    <Text variant={'xLarge'} block>
                        Summarize Result
                        </Text>
                    <Text variant={'large'} >
                        {result_instance}
                    </Text>
                </Stack.Item>
            </Stack>
        );
    }
}
// Styles definition
const stackStyles: IStackStyles = {
    root: {
        background: DefaultPalette.themeTertiary
    }
};
const stackItemStyles: IStackItemStyles = {
    root: {
        background: DefaultPalette.themePrimary,
        color: DefaultPalette.white,
        padding: 5
    }
};

// Tokens definition
const containerStackTokens: IStackTokens = { childrenGap: 5 };
const verticalGapStackTokens: IStackTokens = {
    childrenGap: 10,
    padding: 10
};
const itemAlignmentsStackTokens: IStackTokens = {
    childrenGap: 5,
    padding: 10
};
const clickableStackTokens: IStackTokens = {
    padding: 10
};
const tokens = {
    sectionStack: {
      childrenGap: 10
    },
    headingStack: {
      childrenGap: 5
    }
  };
function roundFloatValue(num: number) {
    return (Math.round(num * 100) / 100).toFixed(2);
}

function getToolTipID(i: number) {
    return getId('tooltipHost' + i)
}

const stackItems: IStackStyles = {
    root: {
        height: '50px'
    }
}

const customScrollStack: IStackStyles = {
    root: {
        height: '100px'
    }
}

// const stackStyles: IStackStyles = {
//     root: {
//         background: DefaultPalette.neutralLight,
//         width: 'auto',
//         padding: '5px'
//     }
// };
const stackItemLabelStyles = mergeStyles({
    alignItems: 'center',
    background: DefaultPalette.themeDarker,
    color: DefaultPalette.white,
    display: 'flex',
    height: 'inherit',
    justifyContent: 'center',
    width: '20%'
});

const stackItemValueStyles = mergeStyles({
    alignItems: 'center',
    background: DefaultPalette.themeDark,
    color: DefaultPalette.white,
    display: 'flex',
    height: 'inherit',
    justifyContent: 'center',
    width: '80%'
});

const classNames = mergeStyleSets({
    wrapper: {
        height: 'inherit',
        position: 'relative',
        maxHeight: 'inherit',
        width: '100%'
    },
    pane: {
        border: '1px solid'
    },
    textContent: {
        padding: '2px 2px'
    }
});

const customSpacingStackTokens: IStackTokens = {
    childrenGap: '10',
};

export default ValidationResult;

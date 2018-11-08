import PlotlyFold from './PlotlyFold';
import TraceRequiredPanel from './TraceRequiredPanel';
import PlotlyPanel from './PlotlyPanel';
import PropTypes from 'prop-types';
import React, {Component, cloneElement} from 'react';
import {EDITOR_ACTIONS} from 'lib/constants';
import {connectTraceToPlot, plotlyTraceToCustomTrace} from 'lib';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import {traceTypes} from 'lib/traceTypes';
import {PanelMessage} from './PanelEmpty';
import {EditorControlsContext} from '../../EditorControls';
import {ConnectTraceToPlotContext} from '../../lib/connectTraceToPlot';

const TraceFold = connectTraceToPlot(PlotlyFold);

class TraceAccordionWrapper extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <EditorControlsContext.Consumer>
        {({fullData, data, localize}) => {
          const newProps = {...this.props, fullData, data, localize};
          return <TraceAccordion {...newProps} />;
        }}
      </EditorControlsContext.Consumer>
    );
  }
}

class TraceAccordion extends Component {
  constructor(props) {
    super(props);
    this.setLocals(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setLocals(nextProps);
  }

  setLocals(props) {
    const base = props.canGroup ? props.fullData : props.data;
    const traceFilterCondition = this.props.traceFilterCondition || (() => true);

    this.filteredTracesDataIndexes = [];
    this.filteredTraces = [];

    if (base && base.length && props.fullData.length) {
      this.filteredTraces = base.filter((t, i) => {
        const fullTrace = props.canGroup ? t : props.fullData.filter(tr => tr.index === i)[0];

        if (fullTrace) {
          const trace = props.data[fullTrace.index];
          if (traceFilterCondition(trace, fullTrace)) {
            this.filteredTracesDataIndexes.push(fullTrace.index);
            return true;
          }
        }

        return false;
      });
    }
  }

  consumerPassToChild() {
    return this.props.children.map((child, key) => {
      return cloneElement(child, {
        ...child.props,
        key,
        consumer: ConnectTraceToPlotContext.Consumer,
      });
    });
  }

  renderGroupedTraceFolds() {
    if (!this.filteredTraces.length || this.filteredTraces.length <= 1) {
      return null;
    }

    const {localize: _} = this.props;
    const dataArrayPositionsByTraceType = {};
    const fullDataArrayPositionsByTraceType = {};

    this.filteredTraces.forEach(trace => {
      const traceType = plotlyTraceToCustomTrace(trace);
      if (!dataArrayPositionsByTraceType[traceType]) {
        dataArrayPositionsByTraceType[traceType] = [];
      }

      if (!fullDataArrayPositionsByTraceType[traceType]) {
        fullDataArrayPositionsByTraceType[traceType] = [];
      }

      dataArrayPositionsByTraceType[traceType].push(trace.index);
      // _expandedIndex is the trace's index in the fullData array
      fullDataArrayPositionsByTraceType[traceType].push(trace._expandedIndex);
    });

    return Object.keys(fullDataArrayPositionsByTraceType).map((type, index) => (
      <TraceFold
        key={index}
        traceIndexes={dataArrayPositionsByTraceType[type]}
        name={traceTypes(_).find(t => t.value === type).label}
        fullDataArrayPosition={fullDataArrayPositionsByTraceType[type]}
      >
        {this.consumerPassToChild()}
      </TraceFold>
    ));
  }

  renderUngroupedTraceFolds() {
    if (this.filteredTraces.length) {
      return this.filteredTraces.map((d, i) => (
        <TraceFold
          key={i}
          traceIndexes={[d.index]}
          canDelete={this.props.canAdd}
          fullDataArrayPosition={[d._expandedIndex]}
        >
          {this.consumerPassToChild()}
        </TraceFold>
      ));
    }
    return null;
  }

  renderTraceFolds() {
    if (this.filteredTraces.length) {
      return this.filteredTraces.map((d, i) => (
        <TraceFold
          key={i}
          traceIndexes={[this.filteredTracesDataIndexes[i]]}
          canDelete={this.props.canAdd}
        >
          {this.consumerPassToChild()}
        </TraceFold>
      ));
    }
    return null;
  }

  renderTracePanelHelp() {
    const _ = this.props.localize;
    return (
      <PanelMessage heading={_('Trace your data.')}>
        <p>
          {_('Traces of various types like bar and line are the building blocks of your figure.')}
        </p>
        <p>
          {_(
            'You can add as many as you like, mixing and matching types and arranging them into subplots.'
          )}
        </p>
        <p>{_('Click on the + button above to add a trace.')}</p>
      </PanelMessage>
    );
  }

  render() {
    const {canAdd, canGroup} = this.props;
    const _ = this.props.localize;

    if (canAdd) {
      const addAction = {
        label: _('Trace'),
        handler: ({onUpdate}) => {
          if (onUpdate) {
            onUpdate({
              type: EDITOR_ACTIONS.ADD_TRACE,
            });
          }
        },
      };
      const traceFolds = this.renderTraceFolds();
      return (
        <PlotlyPanel addAction={addAction}>
          {traceFolds ? traceFolds : this.renderTracePanelHelp()}
        </PlotlyPanel>
      );
    }

    if (canGroup) {
      if (this.filteredTraces.length === 1) {
        return <TraceRequiredPanel>{this.renderUngroupedTraceFolds()}</TraceRequiredPanel>;
      }

      if (this.filteredTraces.length > 1) {
        return (
          <TraceRequiredPanel noPadding>
            <Tabs>
              <TabList>
                <Tab>{_('Individually')}</Tab>
                <Tab>{_('By Type')}</Tab>
              </TabList>
              <TabPanel>
                <PlotlyPanel>{this.renderUngroupedTraceFolds()}</PlotlyPanel>
              </TabPanel>
              <TabPanel>
                <PlotlyPanel>{this.renderGroupedTraceFolds()}</PlotlyPanel>
              </TabPanel>
            </Tabs>
          </TraceRequiredPanel>
        );
      }
    }

    return <TraceRequiredPanel>{this.renderTraceFolds()}</TraceRequiredPanel>;
  }
}

// TraceAccordion.contextTypes = {
//   fullData: PropTypes.array,
//   data: PropTypes.array,
//   localize: PropTypes.func,
// };

TraceAccordion.propTypes = {
  canAdd: PropTypes.bool,
  canGroup: PropTypes.bool,
  children: PropTypes.node,
  traceFilterCondition: PropTypes.func,
  fullData: PropTypes.array,
  data: PropTypes.array,
  localize: PropTypes.func,
};

export default TraceAccordionWrapper;

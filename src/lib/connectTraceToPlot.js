import React, {Component} from 'react';
import PropTypes from 'prop-types';
import nestedProperty from 'plotly.js/src/lib/nested_property';
import {
  getDisplayName,
  plotlyTraceToCustomTrace,
  renderTraceIcon,
  traceTypeToAxisType,
  getFullTrace,
} from '../lib';
import {deepCopyPublic, setMultiValuedContainer} from './multiValues';
import {EDITOR_ACTIONS, SUBPLOT_TO_ATTR} from 'lib/constants';
import {EditorControlsContext} from '../EditorControls';

export const ConnectTraceToPlotContext = React.createContext({});

export default function connectTraceToPlot(WrappedComponent) {
  class TraceConnectedComponentWrapper extends Component {
    constructor(props) {
      super(props);
    }

    render() {
      return (
        <EditorControlsContext.Consumer>
          {({fullData, data, plotly, onUpdate}) => {
            const newProps = {...this.props, fullData, data, plotly, onUpdate};
            return <TraceConnectedComponent {...newProps} />;
          }}
        </EditorControlsContext.Consumer>
      );
    }
  }
  class TraceConnectedComponent extends Component {
    constructor(props) {
      super(props);

      this.deleteTrace = this.deleteTrace.bind(this);
      this.updateTrace = this.updateTrace.bind(this);
      this.setLocals(props);
    }

    componentWillReceiveProps(nextProps) {
      this.setLocals(nextProps);
    }

    setLocals(props) {
      const {traceIndexes, data, fullData, plotly} = props;

      const trace = data[traceIndexes[0]];
      const fullTrace = getFullTrace(props);

      this.childContext = {
        getValObject: attr =>
          !plotly
            ? null
            : plotly.PlotSchema.getTraceValObject(fullTrace, nestedProperty({}, attr).parts),
        updateContainer: this.updateTrace,
        deleteContainer: this.deleteTrace,
        container: trace,
        fullContainer: fullTrace,
        traceIndexes: this.props.traceIndexes,
      };

      if (traceIndexes.length > 1) {
        const multiValuedFullContainer = deepCopyPublic(fullTrace);
        fullData.forEach(t =>
          Object.keys(t).forEach(key =>
            setMultiValuedContainer(multiValuedFullContainer, deepCopyPublic(t), key, {
              searchArrays: true,
            })
          )
        );
        const multiValuedContainer = deepCopyPublic(trace);
        data.forEach(t =>
          Object.keys(t).forEach(key =>
            setMultiValuedContainer(multiValuedContainer, deepCopyPublic(t), key, {
              searchArrays: true,
            })
          )
        );
        this.childContext.fullContainer = multiValuedFullContainer;
        this.childContext.defaultContainer = fullTrace;
        this.childContext.container = multiValuedContainer;
      }

      if (trace && fullTrace) {
        this.icon = renderTraceIcon(plotlyTraceToCustomTrace(trace));
        this.name = fullTrace.name;
      }
    }

    getContext() {
      return this.childContext;
    }

    updateTrace(update) {
      if (this.props.onUpdate) {
        const splitTraceGroup = this.props.fullDataArrayPosition
          ? this.props.fullDataArrayPosition.map(p => this.props.fullData[p]._group)
          : null;

        const containsAnSrc = Object.keys(update).filter(a => a.endsWith('src')).length > 0;

        if (Array.isArray(update)) {
          update.forEach((u, i) => {
            this.props.onUpdate({
              type: EDITOR_ACTIONS.UPDATE_TRACES,
              payload: {
                update: u,
                traceIndexes: [this.props.traceIndexes[i]],
                splitTraceGroup: splitTraceGroup ? splitTraceGroup[i] : null,
              },
            });
          });
        } else if (splitTraceGroup && !containsAnSrc) {
          this.props.traceIndexes.forEach((t, i) => {
            this.props.onUpdate({
              type: EDITOR_ACTIONS.UPDATE_TRACES,
              payload: {
                update,
                traceIndexes: [this.props.traceIndexes[i]],
                splitTraceGroup: splitTraceGroup ? splitTraceGroup[i] : null,
              },
            });
          });
        } else {
          this.props.onUpdate({
            type: EDITOR_ACTIONS.UPDATE_TRACES,
            payload: {
              update,
              traceIndexes: this.props.traceIndexes,
            },
          });
        }
      }
    }

    deleteTrace() {
      const currentTrace = this.props.fullData[this.props.traceIndexes[0]];
      if (!currentTrace && this.props.onUpdate) {
        this.props.onUpdate({
          type: EDITOR_ACTIONS.DELETE_TRACE,
          payload: {
            traceIndexes: this.props.traceIndexes,
          },
        });
        return;
      }
      const axesToBeGarbageCollected = [];
      let subplotToBeGarbageCollected = null;
      const subplotType = traceTypeToAxisType(currentTrace.type);

      if (subplotType) {
        const subplotNames =
          subplotType === 'cartesian'
            ? [currentTrace.xaxis || 'xaxis', currentTrace.yaxis || 'yaxis']
            : currentTrace[SUBPLOT_TO_ATTR[subplotType].data] || SUBPLOT_TO_ATTR[subplotType].data;

        const isSubplotUsedAnywhereElse = (subplotType, subplotName) =>
          this.props.fullData.some(
            trace =>
              (trace[SUBPLOT_TO_ATTR[subplotType].data] === subplotName ||
                (((subplotType === 'xaxis' || subplotType === 'yaxis') && subplotName.charAt(1)) ===
                  '' ||
                  (subplotName.split(subplotType)[1] === '' &&
                    trace[SUBPLOT_TO_ATTR[subplotType].data] === null))) &&
              trace.index !== this.props.traceIndexes[0]
          );

        // When we delete a subplot, make sure no unused axes/subplots are left
        if (subplotType === 'cartesian') {
          if (!isSubplotUsedAnywhereElse('xaxis', subplotNames[0])) {
            axesToBeGarbageCollected.push(subplotNames[0]);
          }
          if (!isSubplotUsedAnywhereElse('yaxis', subplotNames[1])) {
            axesToBeGarbageCollected.push(subplotNames[1]);
          }
        } else {
          if (!isSubplotUsedAnywhereElse(subplotType, subplotNames)) {
            subplotToBeGarbageCollected = subplotNames;
          }
        }
      }

      if (this.props.onUpdate) {
        this.props.onUpdate({
          type: EDITOR_ACTIONS.DELETE_TRACE,
          payload: {
            axesToBeGarbageCollected,
            subplotToBeGarbageCollected,
            traceIndexes: this.props.traceIndexes,
          },
        });
      }
    }

    render() {
      return (
        <ConnectTraceToPlotContext.Provider value={this.getContext()}>
          <WrappedComponent name={this.name} icon={this.icon} {...this.props} />;
        </ConnectTraceToPlotContext.Provider>
      );
    }
  }

  TraceConnectedComponent.displayName = `TraceConnected${getDisplayName(WrappedComponent)}`;

  TraceConnectedComponent.propTypes = {
    traceIndexes: PropTypes.arrayOf(PropTypes.number).isRequired,
    fullDataArrayPosition: PropTypes.arrayOf(PropTypes.number),
    fullData: PropTypes.array,
    data: PropTypes.array,
    plotly: PropTypes.object,
    onUpdate: PropTypes.func,
  };

  // TraceConnectedComponent.contextTypes = {
  //   fullData: PropTypes.array,
  //   data: PropTypes.array,
  //   plotly: PropTypes.object,
  //   onUpdate: PropTypes.func,
  // };

  // TraceConnectedComponent.childContextTypes = {
  //   getValObject: PropTypes.func,
  //   updateContainer: PropTypes.func,
  //   deleteContainer: PropTypes.func,
  //   defaultContainer: PropTypes.object,
  //   container: PropTypes.object,
  //   fullContainer: PropTypes.object,
  //   traceIndexes: PropTypes.array,
  // };

  const {plotly_editor_traits} = WrappedComponent;
  TraceConnectedComponent.plotly_editor_traits = plotly_editor_traits;

  return TraceConnectedComponentWrapper;
}

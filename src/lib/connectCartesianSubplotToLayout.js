import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {getDisplayName, plotlyTraceToCustomTrace, renderTraceIcon, getFullTrace} from '../lib';
import {EditorControlsContext} from '../EditorControls';
import {ConnectLayoutToPlotContext} from './connectLayoutToPlot';

export const ConnectCartesianSubplotToLayoutContext = React.createContext({});

export default function connectCartesianSubplotToLayout(WrappedComponent) {
  class SubplotConnectedComponentWrapper extends Component {
    constructor(props) {
      super(props);
    }

    render() {
      return (
        <EditorControlsContext.Consumer>
          {editorControlsValue => (
            <ConnectLayoutToPlotContext.Consumer>
              {layoutToPlotValue => {
                const newProps = {...this.props, ...editorControlsValue, ...layoutToPlotValue};
                return <SubplotConnectedComponent {...newProps} />;
              }}
            </ConnectLayoutToPlotContext.Consumer>
          )}
        </EditorControlsContext.Consumer>
      );
    }
  }
  class SubplotConnectedComponent extends Component {
    constructor(props) {
      super(props);

      this.updateSubplot = this.updateSubplot.bind(this);
      this.setLocals(props);
    }

    componentWillReceiveProps(nextProps) {
      this.setLocals(nextProps);
    }

    setLocals(props, context) {
      const {xaxis, yaxis, traceIndexes, container, fullContainer, data} = props;
      // const {container, fullContainer, data} = context;

      this.container = {
        xaxis: container[xaxis],
        yaxis: container[yaxis],
      };
      this.fullContainer = {
        xaxis: fullContainer[xaxis],
        yaxis: fullContainer[yaxis],
      };

      const trace = traceIndexes.length > 0 ? data[traceIndexes[0]] : {};
      const fullTrace = getFullTrace(props, context);

      if (trace && fullTrace) {
        this.icon = renderTraceIcon(plotlyTraceToCustomTrace(trace));
        this.name = fullTrace.name;
      }
    }

    getContext() {
      return {
        getValObject: attr =>
          !this.props.getValObject
            ? null
            : this.props.getValObject(
                attr.replace('xaxis', this.props.xaxis).replace('yaxis', this.props.yaxis)
              ),
        updateContainer: this.updateSubplot,
        deleteContainer: this.deleteSubplot,
        container: this.container,
        fullContainer: this.fullContainer,
      };
    }

    updateSubplot(update) {
      const newUpdate = {};
      for (const key in update) {
        const newKey = key.replace('xaxis', this.props.xaxis).replace('yaxis', this.props.yaxis);
        newUpdate[newKey] = update[key];
      }
      this.props.updateContainer(newUpdate);
    }

    render() {
      console.log('connectCartesianSubplotToLayout');
      return (
        <ConnectCartesianSubplotToLayoutContext.Provider value={this.getContext()}>
          <WrappedComponent name={this.name} icon={this.icon} {...this.props} />
        </ConnectCartesianSubplotToLayoutContext.Provider>
      );
    }
  }

  SubplotConnectedComponent.displayName = `SubplotConnected${getDisplayName(WrappedComponent)}`;

  SubplotConnectedComponent.propTypes = {
    xaxis: PropTypes.string.isRequired,
    yaxis: PropTypes.string.isRequired,
    container: PropTypes.object,
    fullContainer: PropTypes.object,
    data: PropTypes.array,
    fullData: PropTypes.array,
    onUpdate: PropTypes.func,
    updateContainer: PropTypes.func,
    getValObject: PropTypes.func,
  };

  // SubplotConnectedComponent.contextTypes = {
  //   container: PropTypes.object,
  //   fullContainer: PropTypes.object,
  //   data: PropTypes.array,
  //   fullData: PropTypes.array,
  //   onUpdate: PropTypes.func,
  //   updateContainer: PropTypes.func,
  //   getValObject: PropTypes.func,
  // };

  // SubplotConnectedComponent.childContextTypes = {
  //   updateContainer: PropTypes.func,
  //   deleteContainer: PropTypes.func,
  //   container: PropTypes.object,
  //   fullContainer: PropTypes.object,
  //   getValObject: PropTypes.func,
  // };

  const {plotly_editor_traits} = WrappedComponent;
  SubplotConnectedComponent.plotly_editor_traits = plotly_editor_traits;

  return SubplotConnectedComponentWrapper;
}

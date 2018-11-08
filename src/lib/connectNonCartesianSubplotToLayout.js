import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {getDisplayName, plotlyTraceToCustomTrace, renderTraceIcon, getFullTrace} from '../lib';

export const ConnectNonCartesianSubplotToLayout = React.createContext({});
import {EditorControlsContext} from '../EditorControls';

import {ConnectLayoutToPlotContext} from './connectLayoutToPlot';

export default function connectNonCartesianSubplotToLayout(WrappedComponent) {
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
      const {subplot, traceIndexes, container, fullContainer, data} = props;
      // const {container, fullContainer, data} = context;

      this.container = container[subplot] || {};
      this.fullContainer = fullContainer[subplot] || {};

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
            : this.props.getValObject(`${this.props.subplot}.${attr}`),
        updateContainer: this.updateSubplot,
        container: this.container,
        fullContainer: this.fullContainer,
      };
    }

    updateSubplot(update) {
      const newUpdate = {};
      for (const key in update) {
        newUpdate[`${this.props.subplot}.${key}`] = update[key];
      }
      this.props.updateContainer(newUpdate);
    }

    render() {
      console.log('connectNonCartesianSubplotToLayout');
      return (
        <ConnectNonCartesianSubplotToLayout.Provider value={this.getContext()}>
          <WrappedComponent name={this.name} icon={this.icon} {...this.props} />
        </ConnectNonCartesianSubplotToLayout.Provider>
      );
    }
  }

  SubplotConnectedComponent.displayName = `SubplotConnected${getDisplayName(WrappedComponent)}`;

  SubplotConnectedComponent.propTypes = {
    subplot: PropTypes.string.isRequired,
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

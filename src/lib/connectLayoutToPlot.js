import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import nestedProperty from 'plotly.js/src/lib/nested_property';
import {getDisplayName} from '../lib';
import {EDITOR_ACTIONS} from './constants';
import {EditorControlsContext} from '../EditorControls';

export const connectLayoutToPlotContext = React.createContext({});

export default function connectLayoutToPlot(WrappedComponent) {
  class LayoutConnectedComponentWrapper extends Component {
    render() {
      return (
        <EditorControlsContext.Consumer>
          {({fullData, _fullLayout, plotly, onUpdate}) => {
            const newProps = {...this.props, fullData, _fullLayout, plotly, onUpdate};
            return <LayoutConnectedComponent {...newProps} />;
          }}
        </EditorControlsContext.Consumer>
      );
    }
  }
  class LayoutConnectedComponent extends Component {
    getContext() {
      const {layout, fullLayout, plotly, onUpdate} = this.context;

      const updateContainer = update => {
        if (!onUpdate) {
          return;
        }
        onUpdate({
          type: EDITOR_ACTIONS.UPDATE_LAYOUT,
          payload: {
            update,
          },
        });
      };

      return {
        getValObject: attr =>
          !plotly
            ? null
            : plotly.PlotSchema.getLayoutValObject(fullLayout, nestedProperty({}, attr).parts),
        updateContainer,
        container: layout,
        fullContainer: fullLayout,
      };
    }

    render() {
      return (
        <connectLayoutToPlotContext.Provider value={this.getContext()}>
          <WrappedComponent {...this.props} />
        </connectLayoutToPlotContext.Provider>
      );
    }
  }

  LayoutConnectedComponent.displayName = `LayoutConnected${getDisplayName(WrappedComponent)}`;

  // LayoutConnectedComponent.contextTypes = {
  //   layout: PropTypes.object,
  //   fullLayout: PropTypes.object,
  //   plotly: PropTypes.object,
  //   onUpdate: PropTypes.func,
  // };

  // LayoutConnectedComponent.childContextTypes = {
  //   getValObject: PropTypes.func,
  //   updateContainer: PropTypes.func,
  //   container: PropTypes.object,
  //   fullContainer: PropTypes.object,
  // };

  const {plotly_editor_traits} = WrappedComponent;
  LayoutConnectedComponent.plotly_editor_traits = plotly_editor_traits;

  return LayoutConnectedComponentWrapper;
}

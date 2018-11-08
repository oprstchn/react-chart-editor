import React, {Component} from 'react';
import PropTypes from 'prop-types';
import nestedProperty from 'plotly.js/src/lib/nested_property';
import {getDisplayName} from '../lib';
import {EDITOR_ACTIONS} from './constants';
import {EditorControlsContext} from '../EditorControls';

export const ConnectLayoutToPlotContext = React.createContext({});

export default function connectLayoutToPlot(WrappedComponent) {
  class LayoutConnectedComponentWrapper extends Component {
    render() {
      return (
        <EditorControlsContext.Consumer>
          {editorControlsValue => {
            const newProps = {...this.props, ...editorControlsValue};
            return <LayoutConnectedComponent {...newProps} />;
          }}
        </EditorControlsContext.Consumer>
      );
    }
  }
  class LayoutConnectedComponent extends Component {
    getContext() {
      const {layout, fullLayout, plotly, onUpdate} = this.props;

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
      console.log('connectLayoutToPlot');
      return (
        <ConnectLayoutToPlotContext.Provider value={this.getContext()}>
          <WrappedComponent {...this.props} />
        </ConnectLayoutToPlotContext.Provider>
      );
    }
  }

  LayoutConnectedComponent.displayName = `LayoutConnected${getDisplayName(WrappedComponent)}`;

  LayoutConnectedComponent.propTypes = {
    layout: PropTypes.object,
    fullLayout: PropTypes.object,
    plotly: PropTypes.object,
    onUpdate: PropTypes.func,
  };

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

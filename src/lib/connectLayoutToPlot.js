import React, {Component, createContext} from 'react';
import PropTypes from 'prop-types';
import nestedProperty from 'plotly.js/src/lib/nested_property';
import {getDisplayName} from '../lib';
import {EDITOR_ACTIONS} from './constants';
import {EditorControlsContext} from '../context';

export default function connectLayoutToPlot(WrappedComponent) {
  class LayoutConnectedComponent extends Component {
    getChildContext() {
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

    provideValue() {
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
        <EditorControlsContext.Consumer>
          {({localize}) => {
            // eslint-disable-next-line no-undefined
            if (WrappedComponent.contextType) {
              const {Consumer} = WrappedComponent.contextType;
              return (
                <Consumer>
                  {value => {
                    WrappedComponent.contextType = createContext({
                      ...this.provideValue(),
                      ...value,
                      localize,
                    });
                    return <WrappedComponent {...this.props} />;
                  }}
                </Consumer>
              );
            }
            WrappedComponent.contextType = createContext({...this.provideValue(), localize});
            return <WrappedComponent {...this.props} />;
          }}
        </EditorControlsContext.Consumer>
      );
    }
  }

  LayoutConnectedComponent.displayName = `LayoutConnected${getDisplayName(WrappedComponent)}`;
  LayoutConnectedComponent.contextType = EditorControlsContext;
  // LayoutConnectedComponent.contextTypes = {
  //   layout: PropTypes.object,
  //   fullLayout: PropTypes.object,
  //   plotly: PropTypes.object,
  //   onUpdate: PropTypes.func,
  // };

  LayoutConnectedComponent.childContextTypes = {
    getValObject: PropTypes.func,
    updateContainer: PropTypes.func,
    container: PropTypes.object,
    fullContainer: PropTypes.object,
  };

  const {plotly_editor_traits} = WrappedComponent;
  LayoutConnectedComponent.plotly_editor_traits = plotly_editor_traits;

  return LayoutConnectedComponent;
}

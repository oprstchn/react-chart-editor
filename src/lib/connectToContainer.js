import React, {Component} from 'react';
import PropTypes from 'prop-types';
import unpackPlotProps from './unpackPlotProps';
import {getDisplayName} from '../lib';

export const containerConnectedContextTypes = {
  localize: PropTypes.func,
  container: PropTypes.object,
  data: PropTypes.array,
  defaultContainer: PropTypes.object,
  fullContainer: PropTypes.object,
  fullData: PropTypes.array,
  fullLayout: PropTypes.object,
  getValObject: PropTypes.func,
  graphDiv: PropTypes.object,
  layout: PropTypes.object,
  onUpdate: PropTypes.func,
  plotly: PropTypes.object,
  updateContainer: PropTypes.func,
  traceIndexes: PropTypes.array,
};

import {EditorControlsContext} from '../EditorControls';
import {ModalProviderContext} from '../components/containers/ModalProvider';
// import {ConnectLayoutToPlotContext} from './connectLayoutToPlot';
// import {ConnectTraceToPlotContext} from './connectTraceToPlot';

export const ConnectToContainerContext = React.createContext({});

export function getNeededContextValue(context) {
  const newContext = {};
  Object.keys(containerConnectedContextTypes).forEach(name => {
    // eslint-disable-next-line no-undefined
    if (context[name] !== null && context[name] !== undefined) {
      newContext[name] = context[name];
    }
  });
  return newContext;
}

export default function connectToContainer(WrappedComponent, config = {}) {
  class ConnectToContext extends Component {
    constructor(props) {
      super(props);
    }

    findContext(props, context) {
      const {consumer: Consumer, ...rest} = props;
      // eslint-disable-next-line no-undefined
      if (Consumer === null || Consumer === undefined) {
        return <ContainerConnectedComponent {...rest} context={context} />;
      }

      return (
        <Consumer>
          {value => {
            const newContext = getNeededContextValue({...value, ...context});
            return <ContainerConnectedComponent {...rest} context={newContext} />;
          }}
        </Consumer>
      );
    }

    render() {
      console.log({getDisplayName: getDisplayName(WrappedComponent), props: this.props});
      return (
        <EditorControlsContext.Consumer>
          {editorControlsValue => (
            <ModalProviderContext.Consumer>
              {modalValue => {
                const context = {
                  ...editorControlsValue,
                  ...modalValue,
                };
                return this.findContext(this.props, context);
              }}
            </ModalProviderContext.Consumer>
          )}
        </EditorControlsContext.Consumer>
      );
    }
  }

  class ContainerConnectedComponent extends Component {
    // Run the inner modifications first and allow more recent modifyPlotProp
    // config function to modify last.
    static modifyPlotProps(props, context, plotProps) {
      if (WrappedComponent.modifyPlotProps) {
        WrappedComponent.modifyPlotProps(props, context, plotProps);
      }
      if (config.modifyPlotProps) {
        config.modifyPlotProps(props, context, plotProps);
      }
    }

    getContextFromProps(props) {
      const {
        localize,
        data,
        fullData,
        layout,
        onUpdate,
        plotly,
        graphDiv,
        container,
        defaultContainer,
        fullContainer,
        getValObject,
        updateContainer,
        traceIndexes,
      } = props;
      return {
        localize,
        data,
        fullData,
        layout,
        onUpdate,
        plotly,
        graphDiv,
        container,
        defaultContainer,
        fullContainer,
        getValObject,
        updateContainer,
        traceIndexes,
      };
    }

    constructor(props) {
      super(props);

      this.setLocals(props);
    }

    componentWillReceiveProps(nextProps) {
      this.setLocals(nextProps);
    }

    setLocals(props) {
      const {context, ...rest} = this.props;
      this.plotProps = unpackPlotProps(rest, context);
      this.attr = props.attr;
      ContainerConnectedComponent.modifyPlotProps(rest, context, this.plotProps);
    }

    getContext() {
      return {
        description: this.plotProps.description,
        attr: this.attr,
      };
    }

    render() {
      // Merge plotprops onto props so leaf components only need worry about
      // props. However pass plotProps as a specific prop in case inner component
      // is also wrapped by a component that `unpackPlotProps`. That way inner
      // component can skip computation as it can see plotProps is already defined.
      const {plotProps = this.plotProps, context, ...props} = Object.assign(
        {},
        this.plotProps,
        this.props
      );
      console.log('here');
      if (props.isVisible) {
        return (
          <ConnectToContainerContext.Provider value={this.getContext()}>
            <WrappedComponent {...props} context={context} plotProps={plotProps} />
          </ConnectToContainerContext.Provider>
        );
      }

      return null;
    }
  }

  ContainerConnectedComponent.displayName = `ContainerConnected${getDisplayName(WrappedComponent)}`;

  // ContainerConnectedComponent.contextTypes = containerConnectedContextTypes;
  // ContainerConnectedComponent.childContextTypes = {
  //   description: PropTypes.string,
  //   attr: PropTypes.string,
  // };

  const {plotly_editor_traits} = WrappedComponent;
  ContainerConnectedComponent.plotly_editor_traits = plotly_editor_traits;

  return ConnectToContext;
}

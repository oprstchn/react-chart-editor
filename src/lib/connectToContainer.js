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
import {ConnectTraceToPlotContext} from './connectTraceToPlot';
import {ModelProviderContext} from '../components/containers/ModalProvider';

export default function connectToContainer(WrappedComponent, config = {}) {
  class ContainerConnectedComponentWrapper extends Component {
    constructor(props) {
      super(props);
    }

    render() {
      return (
        <EditorControlsContext.Consumer>
          {({
            localize,
            data,
            fullData,
            layout,
            onUpdate,
            plotly,
            graphDiv,
            advancedTraceTypeSelector,
            traceTypesConfig,
            plotSchema,
            config,
            glByDefault,
            mapBoxAccess,
            chartHelp,
            srcConverters,
            dataSources,
            dataSourceOptions,
            dataSourceValueRenderer,
            dataSourceOptionRenderer,
          }) => (
            <ModelProviderContext.Consumer>
              {({openModal, handleClose}) => (
                <ConnectTraceToPlotContext.Consumer>
                  {({
                    container,
                    defaultContainer,
                    fullContainer,
                    getValObject,
                    updateContainer,
                    traceIndexes,
                  }) => {
                    const newProps = {
                      ...this.props,
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
                      advancedTraceTypeSelector,
                      traceTypesConfig,
                      plotSchema,
                      config,
                      glByDefault,
                      mapBoxAccess,
                      openModal,
                      handleClose,
                      chartHelp,
                      srcConverters,
                      dataSources,
                      dataSourceOptions,
                      dataSourceValueRenderer,
                      dataSourceOptionRenderer,
                    };
                    return <ContainerConnectedComponent {...newProps} />;
                  }}
                </ConnectTraceToPlotContext.Consumer>
              )}
            </ModelProviderContext.Consumer>
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

    getContextFromProps() {
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
      } = this.props;
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

    componentWillReceiveProps(nextProps, nextContext) {
      this.setLocals(nextProps, nextContext);
    }

    setLocals(props) {
      const context = this.getContextFromProps();
      this.plotProps = unpackPlotProps(props, context);
      this.attr = props.attr;
      ContainerConnectedComponent.modifyPlotProps(props, context, this.plotProps);
    }

    getChildContext() {
      return {
        description: this.plotProps.description,
        attr: this.attr,
      };
    }

    render() {
      console.log('connectToContainer', getDisplayName(WrappedComponent));
      // Merge plotprops onto props so leaf components only need worry about
      // props. However pass plotProps as a specific prop in case inner component
      // is also wrapped by a component that `unpackPlotProps`. That way inner
      // component can skip computation as it can see plotProps is already defined.
      const {plotProps = this.plotProps, ...props} = Object.assign({}, this.plotProps, this.props);
      if (props.isVisible) {
        return <WrappedComponent {...props} plotProps={plotProps} />;
      }

      return null;
    }
  }

  ContainerConnectedComponent.displayName = `ContainerConnected${getDisplayName(WrappedComponent)}`;

  ContainerConnectedComponent.contextTypes = containerConnectedContextTypes;
  ContainerConnectedComponent.childContextTypes = {
    description: PropTypes.string,
    attr: PropTypes.string,
  };

  const {plotly_editor_traits} = WrappedComponent;
  ContainerConnectedComponent.plotly_editor_traits = plotly_editor_traits;

  return ContainerConnectedComponentWrapper;
}

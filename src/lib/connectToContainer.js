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
import {ModelProviderContext} from '../components/containers/ModalProvider';
import {ConnectLayoutToPlotContext} from './connectLayoutToPlot';
import {ConnectTraceToPlotContext} from './connectTraceToPlot';

// export const ConnectToContainerContext = React.createContext({});

function getNeededContextValue(context) {
  const newContext = {};
  Object.keys(containerConnectedContextTypes).forEach(name => {
    // eslint-disable-next-line no-undefined
    if (context[name] !== null && context[name] !== undefined) {
      newContext[name] = context[name];
    }
  });
  console.log({newContext});
  return newContext;
}

export default function connectToContainer(WrappedComponent, config = {}) {
  class ConnectToContext extends Component {
    constructor(props) {
      super(props);
    }

    findContext(props) {
      const WrappedComponentDisplayName = getDisplayName(WrappedComponent);
      switch (WrappedComponentDisplayName) {
        case 'TraceSelector':
        case 'UnconnectedDataSelector':
        case 'UnconnectedAxesCreator':
        case 'UnconnectedSubplotCreator':
          return (
            <ConnectLayoutToPlotContext.Consumer>
              {layoutToPlotValue => (
                <ConnectTraceToPlotContext.Consumer>
                  {TraceToPlotValue => {
                    const newProps = {
                      ...props,
                      ...getNeededContextValue({...layoutToPlotValue, ...TraceToPlotValue}),
                    };
                    return <ContainerConnectedComponent {...newProps} />;
                  }}
                </ConnectTraceToPlotContext.Consumer>
              )}
            </ConnectLayoutToPlotContext.Consumer>
          );
        case 'Info':
          return (
            <ConnectTraceToPlotContext.Consumer>
              {TraceToPlotValue => {
                const newProps = {
                  ...props,
                  ...getNeededContextValue({...TraceToPlotValue}),
                };
                return <ContainerConnectedComponent {...newProps} />;
              }}
            </ConnectTraceToPlotContext.Consumer>
          );
        default:
          return <ContainerConnectedComponent {...props} />;
      }
    }

    render() {
      console.log({getDisplayName: getDisplayName(WrappedComponent)});
      return (
        <EditorControlsContext.Consumer>
          {({
            localize,
            data,
            fullData,
            fullLayout,
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
              {({openModal, handleClose}) => {
                const newProps = {
                  ...this.props,
                  localize,
                  data,
                  fullData,
                  fullLayout,
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
                  openModal,
                  handleClose,
                  chartHelp,
                  srcConverters,
                  dataSources,
                  dataSourceOptions,
                  dataSourceValueRenderer,
                  dataSourceOptionRenderer,
                };
                return this.findContext(newProps);
              }}
            </ModelProviderContext.Consumer>
          )}
        </EditorControlsContext.Consumer>
      );
    }
  }

  // class ContainerConnectedComponentWrapper extends Component {
  //   constructor(props) {
  //     super(props);
  //   }
  //
  //   render() {
  //     return (
  //       <EditorControlsContext.Consumer>
  //         {({
  //           localize,
  //           data,
  //           fullData,
  //           fullLayout,
  //           layout,
  //           onUpdate,
  //           plotly,
  //           graphDiv,
  //           advancedTraceTypeSelector,
  //           traceTypesConfig,
  //           plotSchema,
  //           config,
  //           glByDefault,
  //           mapBoxAccess,
  //           chartHelp,
  //           srcConverters,
  //           dataSources,
  //           dataSourceOptions,
  //           dataSourceValueRenderer,
  //           dataSourceOptionRenderer,
  //         }) => (
  //           <ModelProviderContext.Consumer>
  //             {({openModal, handleClose}) => {
  //               const newProps = {
  //                 ...this.props,
  //                 localize,
  //                 data,
  //                 fullData,
  //                 fullLayout,
  //                 layout,
  //                 onUpdate,
  //                 plotly,
  //                 graphDiv,
  //                 advancedTraceTypeSelector,
  //                 traceTypesConfig,
  //                 plotSchema,
  //                 config,
  //                 glByDefault,
  //                 mapBoxAccess,
  //                 openModal,
  //                 handleClose,
  //                 chartHelp,
  //                 srcConverters,
  //                 dataSources,
  //                 dataSourceOptions,
  //                 dataSourceValueRenderer,
  //                 dataSourceOptionRenderer,
  //               };
  //               return <ContainerConnectedComponent {...newProps} />;
  //             }}
  //           </ModelProviderContext.Consumer>
  //         )}
  //       </EditorControlsContext.Consumer>
  //     );
  //   }
  // }
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
      const context = this.getContextFromProps(props);
      console.log({props, context});
      this.plotProps = unpackPlotProps(props, context);
      this.attr = props.attr;
      ContainerConnectedComponent.modifyPlotProps(props, context, this.plotProps);
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
      const {plotProps = this.plotProps, ...props} = Object.assign({}, this.plotProps, this.props);
      if (props.isVisible) {
        const newProps = {...this.props, ...this.getContext()};
        return <WrappedComponent {...newProps} plotProps={plotProps} />;
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

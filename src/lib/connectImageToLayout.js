import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {getDisplayName} from '../lib';
import {EDITOR_ACTIONS} from './constants';
import {recursiveMap} from './recursiveMap';

export default function connectImageToLayout(WrappedComponent) {
  class ImageConnectedComponent extends Component {
    constructor(props) {
      super(props);

      this.deleteImage = this.deleteImage.bind(this);
      this.updateImage = this.updateImage.bind(this);
      this.setLocals(props);
    }

    componentWillReceiveProps(nextProps) {
      this.setLocals(nextProps);
    }

    setLocals(props) {
      const {context, imageIndex} = props;
      const {container, fullContainer} = context;

      const images = container.images || [];
      const fullImages = fullContainer.images || [];
      this.container = images[imageIndex];
      this.fullContainer = fullImages[imageIndex];
    }

    // getChildContext() {
    //   return {
    //     getValObject: attr =>
    //       !this.context.getValObject ? null : this.context.getValObject(`images[].${attr}`),
    //     updateContainer: this.updateImage,
    //     deleteContainer: this.deleteImage,
    //     container: this.container,
    //     fullContainer: this.fullContainer,
    //   };
    // }

    provideValue() {
      return {
        getValObject: attr =>
          !this.props.context.getValObject
            ? null
            : this.props.context.getValObject(`images[].${attr}`),
        updateContainer: this.updateImage,
        deleteContainer: this.deleteImage,
        container: this.container,
        fullContainer: this.fullContainer,
      };
    }

    updateImage(update) {
      const newUpdate = {};
      const {imageIndex} = this.props;
      for (const key in update) {
        const newkey = `images[${imageIndex}].${key}`;
        newUpdate[newkey] = update[key];
      }
      this.props.context.updateContainer(newUpdate);
    }

    deleteImage() {
      if (this.props.context.onUpdate) {
        this.props.context.onUpdate({
          type: EDITOR_ACTIONS.DELETE_IMAGE,
          payload: {imageIndex: this.props.imageIndex},
        });
      }
    }

    render() {
      const newProps = {...this.props, context: this.provideValue()};
      if (this.props.children) {
        return (
          <WrappedComponent {...newProps}>
            {recursiveMap(this.props.children, this.provideValue())}
          </WrappedComponent>
        );
      }
      return <WrappedComponent {...newProps} />;
    }
  }

  ImageConnectedComponent.displayName = `ImageConnected${getDisplayName(WrappedComponent)}`;

  ImageConnectedComponent.propTypes = {
    imageIndex: PropTypes.number.isRequired,
  };

  ImageConnectedComponent.requireContext = {
    container: PropTypes.object,
    fullContainer: PropTypes.object,
    data: PropTypes.array,
    onUpdate: PropTypes.func,
    updateContainer: PropTypes.func,
    getValObject: PropTypes.func,
  };

  // ImageConnectedComponent.contextTypes = {
  //   container: PropTypes.object,
  //   fullContainer: PropTypes.object,
  //   data: PropTypes.array,
  //   onUpdate: PropTypes.func,
  //   updateContainer: PropTypes.func,
  //   getValObject: PropTypes.func,
  // };
  //
  // ImageConnectedComponent.childContextTypes = {
  //   updateContainer: PropTypes.func,
  //   deleteContainer: PropTypes.func,
  //   container: PropTypes.object,
  //   fullContainer: PropTypes.object,
  //   getValObject: PropTypes.func,
  // };

  const {plotly_editor_traits} = WrappedComponent;
  ImageConnectedComponent.plotly_editor_traits = plotly_editor_traits;

  return ImageConnectedComponent;
}

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {getDisplayName} from '../lib';
import {EDITOR_ACTIONS} from './constants';
import {recursiveMap} from './recursiveMap';
import {EditorControlsContext} from '../context';

export default function connectImageToLayout(WrappedComponent) {
  class ImageConnectedComponent extends Component {
    constructor(props) {
      super(props);

      this.deleteImage = this.deleteImage.bind(this);
      this.updateImage = this.updateImage.bind(this);
      this.moveImage = this.moveImage.bind(this);
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
        moveContainer: this.moveImage,
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
      if (this.context.onUpdate) {
        this.context.onUpdate({
          type: EDITOR_ACTIONS.DELETE_IMAGE,
          payload: {imageIndex: this.props.imageIndex},
        });
      }
    }

    moveImage(direction) {
      if (this.context.onUpdate) {
        const imageIndex = this.props.imageIndex;
        const desiredIndex = direction === 'up' ? imageIndex - 1 : imageIndex + 1;
        this.context.onUpdate({
          type: EDITOR_ACTIONS.MOVE_TO,
          payload: {
            fromIndex: imageIndex,
            toIndex: desiredIndex,
            path: 'layout.images',
          },
        });
      }
    }

    render() {
      const newProps = {
        ...this.props,
        context: {...this.provideValue(), fullLayout: this.context.fullLayout},
      };
      if (this.props.children) {
        return (
          <WrappedComponent {...newProps}>
            {recursiveMap(this.props.children, {
              ...this.provideValue(),
              fullLayout: this.context.fullLayout,
            })}
          </WrappedComponent>
        );
      }
      return <WrappedComponent {...newProps} />;
    }
  }

  ImageConnectedComponent.displayName = `ImageConnected${getDisplayName(WrappedComponent)}`;

  ImageConnectedComponent.contextType = EditorControlsContext;

  ImageConnectedComponent.requireContext = {
    updateContainer: PropTypes.func,
    deleteContainer: PropTypes.func,
    container: PropTypes.object,
    fullContainer: PropTypes.object,
    getValObject: PropTypes.func,
    moveContainer: PropTypes.func,
  };

  ImageConnectedComponent.propTypes = {
    imageIndex: PropTypes.number.isRequired,
    children: PropTypes.node,
    context: PropTypes.any,
  };

  const {plotly_editor_traits} = WrappedComponent;
  ImageConnectedComponent.plotly_editor_traits = plotly_editor_traits;

  return ImageConnectedComponent;
}

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {CloseIcon} from 'plotly-icons';
import {ModalProviderContext} from './ModalProvider';

const ModalHeader = ({title, handleClose}) => (
  <div className="modal__header">
    {title ? <div className="modal__header__title">{title}</div> : null}
    {handleClose ? (
      <div className="modal__header__close" onClick={handleClose ? () => handleClose() : null}>
        <CloseIcon />
      </div>
    ) : null}
  </div>
);

const ModalContent = ({children}) => <div className="modal__content">{children}</div>;

class ModalWrapper extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ModalProviderContext.Consumer>
        {({handleClose, isAnimatingOut}) => {
          const {children, ...rest} = this.props;
          const newProps = {...rest, handleClose, isAnimatingOut};
          return <Modal {...newProps}>{children}</Modal>;
        }}
      </ModalProviderContext.Consumer>
    );
  }
}

class Modal extends Component {
  constructor(props) {
    super(props);
    this.escFunction = this.escFunction.bind(this);
  }

  escFunction(event) {
    const escKeyCode = 27;
    if (event.keyCode === escKeyCode) {
      this.props.handleClose();
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.escFunction, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.escFunction, false);
  }

  render() {
    const {children, title} = this.props;
    let classes = 'modal';
    if (this.props.isAnimatingOut) {
      classes += ' modal--animate-out';
    }
    return (
      <div className={classes}>
        <div className="modal__card">
          <ModalHeader title={title} handleClose={() => this.props.handleClose()} />
          <ModalContent>{children}</ModalContent>
        </div>
        <div className="modal__backdrop" onClick={() => this.props.handleClose()} />
      </div>
    );
  }
}

ModalHeader.propTypes = {
  title: PropTypes.node,
  handleClose: PropTypes.func.isRequired,
};

ModalContent.propTypes = {
  children: PropTypes.node.isRequired,
};

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  handleClose: PropTypes.func,
  isAnimatingOut: PropTypes.bool,
};

// Modal.contextTypes = {
//   handleClose: PropTypes.func,
//   isAnimatingOut: PropTypes.bool,
// };

export default ModalWrapper;

export {ModalHeader, ModalContent};

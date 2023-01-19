import React from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const ErrorModal = function(props){

    const [show, setShow] = React.useState(false);
   
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>

            <Modal show={props.show} onHide={props.onColose}>
                <div className="transparent_bg"></div>

                <Modal.Header className="z_index_6">
                    <Modal.Title className="error_modal_title">Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body className="z_index_6">{props.msg}</Modal.Body>
                <Modal.Footer className="z_index_6">
                    <Button variant="primary" onClick={props.onClose} disabled={false}>  
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ErrorModal;

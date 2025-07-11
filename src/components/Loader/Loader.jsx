import React from "react";
import PropTypes from "prop-types";
import './Loader.css';

const Loader = ({message}) => {
    return (
        <div className="loader-container">
            <div className="loader"></div>
            <p>{message}</p>
        </div>
    );
}

export default Loader;

Loader.propTypes = {
    message: PropTypes.string.isRequired
}
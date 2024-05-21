import React from 'react';
import './spinner.css'; // Assurez-vous d'avoir un fichier CSS pour les styles

const Spinner: React.FC = () => {
    return (
        <div className="spinner-container">
            <div className="spinner"></div>
        </div>
    );
};

export default Spinner;


import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const EditCarModal = ({ carToEdit, handleEditSubmit, closeModal }) => {
    const [formData, setFormData] = useState(carToEdit);
    const [newImageFile, setNewImageFile] = useState(null);
    const [optionsString, setOptionsString] = useState("");

    useEffect(() => {
        setFormData(carToEdit);
        setOptionsString(JSON.stringify(carToEdit.options || [], null, 2));
    }, [carToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionsChange = (e) => {
        setOptionsString(e.target.value);
        try {
            const parsedOptions = JSON.parse(e.target.value);
            setFormData(prev => ({ ...prev, options: parsedOptions }));
        } catch (error) {
        }
    };

    const handleImageChange = (e) => {
        setNewImageFile(e.target.files[0]);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('make', formData.make);
        data.append('model', formData.model);
        data.append('year', formData.year);
        data.append('city', formData.city);
        data.append('country', formData.country);
        data.append('pricePerDay', formData.pricePerDay);
        data.append('description', formData.description);
        
        try {
            JSON.parse(optionsString); 
            data.append('options', optionsString);
        } catch (error) {
            alert("Error in Options JSON format. Please correct it.");
            return;
        }
        
        if (newImageFile) {
            data.append('image', newImageFile);
        }

        handleEditSubmit(data, formData._id);
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">Edit Car: {carToEdit.make} {carToEdit.model}</h3>
                    <button className="modal-close" onClick={closeModal} aria-label="Close modal">×</button>
                </div>
                
                <form id="edit-car-form" onSubmit={onSubmit} className="modal-body">
                    
                    <div className="form-group">
                        <label className="form-label">Make:</label>
                        <input 
                            type="text" 
                            name="make" 
                            value={formData.make} 
                            onChange={handleChange} 
                            className="form-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Model:</label>
                        <input 
                            type="text" 
                            name="model" 
                            value={formData.model} 
                            onChange={handleChange} 
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">City:</label>
                        <input 
                            type="text" 
                            name="city" 
                            value={formData.city} 
                            onChange={handleChange} 
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Price Per Day (PLN):</label>
                        <input 
                            type="number" 
                            name="pricePerDay" 
                            value={formData.pricePerDay} 
                            onChange={handleChange} 
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description (Category):</label>
                        <input 
                            type="text" 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            className="form-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Options (JSON Array):</label>
                        <textarea
                            name="options"
                            value={optionsString}
                            onChange={handleOptionsChange}
                            className="form-input"
                            rows="3"
                            placeholder='[ "Option1", "Option2" ]'
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Upload New Image (replaces old):</label>
                        <input 
                            type="file" 
                            name="image" 
                            accept="image/*"
                            onChange={handleImageChange} 
                            className="form-input"
                        />
                    </div>
                </form>
                
                <div className="modal-footer sticky-footer my-modal">
                    <span className="modal-price">{formData.pricePerDay || 0} PLN</span>
                    <div className="buttons-group">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                            Cancel
                        </button>
                        <button type="submit" form="edit-car-form" className="btn btn-primary">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

EditCarModal.propTypes = {
    carToEdit: PropTypes.object.isRequired,
    handleEditSubmit: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
};

export default EditCarModal;
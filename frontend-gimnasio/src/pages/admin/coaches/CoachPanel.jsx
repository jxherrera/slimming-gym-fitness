import React, { useState, useEffect } from 'react';
import '../shared/admin-core.css';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../services/api';
import { FiUser, FiEdit3, FiTarget } from 'react-icons/fi';

const CoachPanel = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Global Theme State
    const { isDarkMode, toggleTheme } = useTheme();
    const themeClass = isDarkMode ? 'theme-dark' : 'theme-light';
    const themeIcon = isDarkMode ? '☀️' : '🌙';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [goalInput, setGoalInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic coachId from global Auth
    const { user } = useAuth();
    const coachId = user?.userId;

    const fetchClients = async () => {
        if (!coachId) {
            setError("No se pudo identificar tu sesión como entrenador.");
            setLoading(false);
            return;
        }
        try {
            const response = await api.get(`/routines/coach/${coachId}/clients`);
            
            const data = response.data;
            if (data.success) {
                setClients(data.clients);
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error("Error fetching clients:", err);
            setError("No se pudo cargar la lista de clientes.");
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchClients();
    }, [coachId]);

    const openModal = (client) => {
        setSelectedClient(client);
        setGoalInput(client.Goal || ''); 
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
        setGoalInput('');
    };

    const handleAssignRoutine = async (e) => {
        e.preventDefault(); 
        setIsSubmitting(true);

        try {
            const response = await api.post('/routines/assign', {
                userId: selectedClient.UserID,
                coachId: coachId,
                goal: goalInput
            });

            const data = response.data;

            if (data.success) {
                closeModal();
                fetchClients(); 
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error asignando rutina:", error);
            alert("Error al conectar con el servidor para asignar la rutina.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className={`admin-page ${themeClass}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: '#8b8593' }}>Cargando tus clientes...</div>
        </div>
    );
    
    if (error) return (
        <div className={`admin-page ${themeClass}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: '#f87171' }}>{error}</div>
        </div>
    );

    return (
        <div className={`admin-page ${themeClass} fade-in`} style={{ padding: '20px' }}>
            <div className="settings-main-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 className="settings-title">Panel del Entrenador</h2>
                        <p style={{ color: '#8b8593', marginBottom: '30px' }}>
                            Bienvenido, <strong>{user.firstName}</strong>. Gestiona las rutinas y objetivos de tus clientes asignados.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Cambiar tema"
                        style={{ width: '40px', height: '40px', borderRadius: '10px' }}
                    >
                        {themeIcon}
                    </button>
                </div>

                <div className="settings-sub-header">Mis Clientes Asignados</div>

                {clients.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8b8593', background: '#f4f4f5', borderRadius: '16px' }} className="theme-dark-fix-bg">
                        Aún no tienes clientes asignados.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {clients.map((client) => (
                            <div className="setting-row" key={client.UserID}>
                                <div className={`setting-icon ${client.Status === 'Activo' ? 'success' : 'warning'}`}>
                                    <FiUser />
                                </div>
                                
                                <div className="setting-content">
                                    <div className="setting-title">{client.Email}</div>
                                    <div className="setting-desc" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div>
                                            Estado: <span style={{ fontWeight: '600', color: client.Status === 'Activo' ? '#10b981' : '#f59e0b' }}>
                                                {client.Status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FiTarget style={{ color: '#3b82f6' }} />
                                            <span>Objetivo: <strong>{client.Goal || 'Sin definir'}</strong></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="setting-action">
                                    <button 
                                        className="btn-pill-blue"
                                        onClick={() => openModal(client)}
                                        title="Asignar / Editar Rutina"
                                    >
                                        <FiEdit3 /> Asignar Rutina
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL DE ASIGNACIÓN DE RUTINA */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-card scale-in" style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h3>Definir Objetivo Deportivo</h3>
                            <button className="modal-close" onClick={closeModal}>&times;</button>
                        </div>
                        
                        <div style={{ marginBottom: '16px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', fontSize: '14px', color: '#4b5563' }} className="theme-dark-fix-bg">
                            Cliente: <strong style={{ color: '#111827' }} className="theme-dark-fix-text">{selectedClient?.Email}</strong>
                        </div>
                        
                        <form onSubmit={handleAssignRoutine} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>
                                    Objetivo (Ej. Hipertrofia, Pérdida de Peso)
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                                    placeholder="Ingrese el objetivo de la rutina"
                                    value={goalInput}
                                    onChange={(e) => setGoalInput(e.target.value)}
                                />
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                                <button 
                                    type="button"
                                    onClick={closeModal}
                                    disabled={isSubmitting}
                                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: '500' }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="btn-pill-blue"
                                    disabled={isSubmitting}
                                    style={{ padding: '10px 20px' }}
                                >
                                    {isSubmitting ? 'Guardando...' : 'Guardar Rutina'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachPanel;
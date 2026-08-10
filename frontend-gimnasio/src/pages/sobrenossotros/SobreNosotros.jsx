import React from 'react';
import '../../components/layout/Pages.css';
import { siteConfig } from '../../config/site';

const SobreNosotros = () => {
  return (
    <div className="page-container">
      <div className="content-wrap">
        <h1 className="page-title">Sobre Nosotros</h1>
        <p className="page-description">
          {siteConfig.description}
        </p>
      </div>
    </div>
  );
};

export default SobreNosotros;
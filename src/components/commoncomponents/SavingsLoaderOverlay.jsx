import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import './SavingsLoaderOverlay.css';

import loaderBackgroundHouse from '../../assets/images/loader/loader-bg-house.jpg';
import loaderDecorPanel from '../../assets/images/loader/loader-decor-1.svg';
import loaderDecorLeaf from '../../assets/images/loader/loader-decor-2.svg';
import loaderMagnifier from '../../assets/images/loader/loader-magnifier.svg';
import loaderLogo from '../../assets/images/loader/loader-logo.svg';

const LoaderBackground = () => (
  <div className="savings_loader_overlay__bg" aria-hidden="true">
    <img className="savings_loader_overlay__panel" src={loaderDecorPanel} alt="" />

    <div className="savings_loader_overlay__photo_frame">
      <img className="savings_loader_overlay__photo" src={loaderBackgroundHouse} alt="" />
    </div>

    <div className="savings_loader_overlay__gradient savings_loader_overlay__gradient--top" />
    <div className="savings_loader_overlay__gradient savings_loader_overlay__gradient--middle" />
    <div className="savings_loader_overlay__gradient savings_loader_overlay__gradient--bottom" />
  </div>
);

const LoaderBrand = () => (
  <div className="savings_loader_overlay__brand">
    <img src={loaderLogo} alt="Robin" />
  </div>
);

const LoaderHero = () => (
  <div className="savings_loader_overlay__hero" aria-hidden="true">
    <img className="savings_loader_overlay__leaf" src={loaderDecorLeaf} alt="" />
    <img className="savings_loader_overlay__magnifier" src={loaderMagnifier} alt="" />
  </div>
);

const SavingsLoaderOverlay = ({ message = 'בודק אפשרויות חיסכון…' }) => {
  useEffect(() => {
    document.body.classList.add('savings_loader_overlay_open');
    return () => {
      document.body.classList.remove('savings_loader_overlay_open');
    };
  }, []);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <section className="savings_loader_overlay" aria-label="מסך טעינה">
      <div className="savings_loader_overlay__canvas">
        <LoaderBackground />
        <LoaderBrand />
        <LoaderHero />

        <p className="savings_loader_overlay__text" role="status" aria-live="polite">
          {message}
        </p>
      </div>
    </section>
    ,
    document.body
  );
};

export default SavingsLoaderOverlay;

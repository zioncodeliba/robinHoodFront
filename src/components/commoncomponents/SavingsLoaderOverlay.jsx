import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import './SavingsLoaderOverlay.css';

import loaderBackgroundHouse from '../../assets/images/loader/loader-bg-house.jpg';
import loaderDecorPanel from '../../assets/images/loader/loader-decor-1.svg';
import loaderDecorLeaf from '../../assets/images/loader/loader-decor-2.svg';
import loaderMagnifier from '../../assets/images/loader/loader-magnifier.svg';
import loaderServices101Png from '../../assets/images/loader/loader-services1-01.png';
import loaderServices102Png from '../../assets/images/loader/loader-services1-02.png';
import loaderSharePng from '../../assets/images/loader/loader-share.png';
import loaderFinalPng from '../../assets/images/loader/loader-final.png';
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

const LoaderHero = ({ heroContent, loaderClass }) => (
  <div className="savings_loader_overlay__hero" aria-hidden="true">
    <img className="savings_loader_overlay__leaf" src={loaderDecorLeaf} alt="" />
    {Array.isArray(heroContent) ? (
      heroContent.map(({ src, className }, index) => (
        <img key={`loader2-img-${index}`} className={className} src={src} alt="" />
      ))
    ) : (
      <img
        className={`savings_loader_overlay__magnifier savings_loader_overlay__magnifier--${loaderClass}`}
        src={heroContent}
        alt=""
      />
    )}
  </div>
);

const LOADER_MESSAGES = {
  loader1: 'בודק אפשרויות חיסכון…',
  loader2: 'מריץ אלפי תרחישים…',
  loader3: 'מחשב תמהיל חכם עבורך…',
  loader4: 'עוד רגע..מסכם את התוצאות…',
};

const LOADER_HERO_IMAGES = {
  loader1: loaderMagnifier,
  loader2: [
    {
      src: loaderServices101Png,
      className: 'savings_loader_overlay__hero_img savings_loader_overlay__hero_img--services_01',
    },
    {
      src: loaderServices102Png,
      className: 'savings_loader_overlay__hero_img savings_loader_overlay__hero_img--services_02',
    },
  ],
  loader3: loaderSharePng,
  loader4: loaderFinalPng,
};

const SavingsLoaderOverlay = ({ onComplete, apiComplete }) => {
  const [active, setActive] = useState('loader1');
  const completedRef = useRef(false);

  useEffect(() => {
    document.body.classList.add('savings_loader_overlay_open');
    return () => document.body.classList.remove('savings_loader_overlay_open');
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setActive('loader2'), 5000);
    const t2 = setTimeout(() => setActive('loader3'), 10000);
    const t3 = setTimeout(() => setActive('loader4'), 15000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    if (active === 'loader4' && apiComplete && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [active, apiComplete, onComplete]);

  if (typeof document === 'undefined') return null;

  const renderCanvas = (loaderClass, message) => (
    <div key={loaderClass} className={`savings_loader_overlay__canvas ${loaderClass}`}>
      <LoaderBackground />
      <LoaderBrand />
      <LoaderHero
        heroContent={LOADER_HERO_IMAGES[loaderClass]}
        loaderClass={loaderClass}
      />
      <p className="savings_loader_overlay__text" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );

  return createPortal(
    <section className="savings_loader_overlay" data-active={active} aria-label="מסך טעינה">
      {renderCanvas('loader1', LOADER_MESSAGES.loader1)}
      {renderCanvas('loader2', LOADER_MESSAGES.loader2)}
      {renderCanvas('loader3', LOADER_MESSAGES.loader3)}
      {renderCanvas('loader4', LOADER_MESSAGES.loader4)}
    </section>
    ,
    document.body
  );
};

export default SavingsLoaderOverlay;

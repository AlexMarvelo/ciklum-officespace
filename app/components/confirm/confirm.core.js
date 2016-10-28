'use strict';

const colors = require('../../config/colors.json');


const confirmModalFrame = {
  headerColor: colors.themeColor,
  width: 300,
  padding: 15,
  zindex: 1040,
  closeOnEscape: false,
  history: false,
  icon: false,
  focusInput: true,
  overlayClose: false,
  autoOpen: true,
};


const getTemplate = (question = {}) => {
  const msg = question.msg || 'Are you sure?';
  const successBtnText = question.successBtnText || 'Continue';
  const cancelBtnText = question.cancelBtnText || 'Cancel';
  return `
    <div class="confirm">
      <form action="#" class="confirm-form" autocomplete="off" novalidate>
        <p class="confirm-text">${msg}</p>
        <div class="row">
          <div class="col-xs-6 col-thinpad-right">
            <button type="button" class="btn btn-danger confirm-btn confirm-btn--cancel">${cancelBtnText}</button>
          </div>
          <div class="col-xs-6 col-thinpad-left">
            <button type="submit" class="btn btn-default confirm-btn">${successBtnText}</button>
          </div>
        </div>
        <input type="hidden" class="hidden">
      </form>
    </div>
  `;
};


const confirm = (question, container = window.jQuery('body')) => {
  const confirmModal = window.jQuery(getTemplate(question));
  container.append(confirmModal);

  return new Promise((resolve, reject) => {
    const init = () => {
      confirmModal.find('.confirm-form').submit(event => {
        event.preventDefault();
        confirmModal.iziModal('close');
        resolve(true);
      });

      confirmModal.find('.confirm-btn--cancel').click(event => {
        event.preventDefault();
        confirmModal.iziModal('close');
        reject(false);
      });

      confirmModal.find('.iziModal-button-close').click(event => {
        event.preventDefault();
        confirmModal.iziModal('close');
        reject(false);
      });
    };

    const confirmModalConfig = Object.assign(confirmModalFrame, {
      title: question.title || 'Confirm your action',
      subtitle: question.subtitle,
      onOpening: init,
      onClosed: () => {
        confirmModal.iziModal('destroy');
        confirmModal.remove();
      },
    });

    confirmModal.iziModal(confirmModalConfig);
  });
};


module.exports = confirm;

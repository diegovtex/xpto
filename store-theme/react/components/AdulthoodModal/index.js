import React, { useState, useLayoutEffect } from "react";
import { ModalDialog } from "vtex.styleguide";

import { injectIntl } from "react-intl";
import { formatIOMessage } from "vtex.native-types";

const AdulthoodModal = (props) => {
  const [showModal, setShowModal] = useState(true);

  const redirectOnCancel = () => {
    window.location.href = "https://www.google.com";
  };

  const formatMessage = (id) => {
    return formatIOMessage({ id: id, intl: props.intl });
  };

  return (
    <div className="adulthook-modal">
      <ModalDialog
        centered
        confirmation={{
          onClick: () => setShowModal(false),
          label: formatMessage(props.modalYes),
        }}
        cancelation={{
          onClick: redirectOnCancel,
          label: formatMessage(props.modalNo),
        }}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      >
        <h1>{formatMessage(props.confirm)}</h1>
        <p>{formatMessage(props.question)}</p>
      </ModalDialog>
    </div>
  );
};

AdulthoodModal.getSchema = () => {
  return {
    title: "Adulthood Modal",
    description: "Adulthood Modal",
    type: "object",
    properties: {
      modalYes: {
        default: "Yes",
        title: "admin/editor.adulthood-modal.confirmation.title",
        type: "string",
      },
      modalNo: {
        default: "No",
        title: "admin/editor.adulthood-modal.denial.title",
        type: "string",
      },
      confirm: {
        default: "Confirm?",
        title: "admin/editor.adulthood-modal.confirm.title",
        type: "string",
      },
      question: {
        default: "Are you over 18?",
        title: "admin/editor.adulthood-modal.question.title",
        type: "string",
      },
    },
  };
};
export default injectIntl(AdulthoodModal);

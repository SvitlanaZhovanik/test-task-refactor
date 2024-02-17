import s from "./primary-button.module.scss";
import classNames from "classnames";
import React from "react";

interface IProps {
  onClick: (event?) => void;
  disabled?: boolean;
  className?: string;
  icon?: "download";
}

export const PrimaryButton: React.FC<
  IProps &
    React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >
> = (props) => {
  const {
    onClick,
    disabled = false,
    className,
    icon,
    children,
    ...other
  } = props;

  const classes: Record<string, boolean> = {
    [s.primaryButton]: true,
  };

  if (className) {
    classes[className] = true;
  }

  if (icon) {
    classes[s.withIcon] = true;
  }

  const renderIcon = () => {
    return null;
  };

  return (
    <button
      className={classNames(classes)}
      onClick={onClick}
      disabled={disabled}
      {...other}
    >
      <>
        {renderIcon()}
        {children}
      </>
    </button>
  );
};

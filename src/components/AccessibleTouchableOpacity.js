import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';

const AccessibleTouchableOpacity = (props) => {
  const handleFocus = () => {
    // จัดการ focus event
    if (props.onFocus) {
      props.onFocus();
    }
  };

  const handleBlur = () => {
    // จัดการ blur event
    if (props.onBlur) {
      props.onBlur();
    }
  };

  return (
    <TouchableOpacity
      {...props}
      accessible={true}
      focusable={Platform.OS === 'web'}
      onFocus={handleFocus}
      onBlur={handleBlur}
      // Override default accessibility properties
      accessibilityRole={props.accessibilityRole || 'button'}
      // ป้องกัน aria-hidden conflicts
      importantForAccessibility="yes"
    />
  );
};

export default AccessibleTouchableOpacity;

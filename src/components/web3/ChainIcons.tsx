"use client";

import React from "react";

interface IconProps {
  className?: string;
}

export function LensIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M464.993 319.397C464.993 403.284 396.829 471.5 312.989 471.5C270.036 471.5 231.659 453.634 204.639 424.698C199.623 419.162 197.083 411.813 197.802 404.431L206.693 325.286C207.873 312.509 219.116 302.886 232.01 302.886H393.969C433.228 302.886 464.993 334.702 464.993 373.941V319.397Z"
        fill="#ABFE2C"
      />
      <path
        d="M302.793 134.571C302.793 120.259 291.509 108.948 277.2 108.948H46.1965C38.7044 108.948 32.7144 114.939 32.7144 122.436C32.7144 129.932 38.7046 135.923 46.1965 135.923H277.2C291.508 135.923 302.793 135.923 302.793 134.571Z"
        fill="#ABFE2C"
      />
      <path
        d="M302.793 194.182C302.793 179.87 291.509 168.559 277.2 168.559H46.1965C38.7044 168.559 32.7144 174.55 32.7144 182.046C32.7144 189.542 38.7044 195.534 46.1965 195.534H277.2C291.508 195.534 302.793 208.495 302.793 194.182Z"
        fill="#ABFE2C"
      />
      <path
        d="M197.802 243.17H46.1968C38.7046 243.17 32.7144 249.162 32.7144 256.658C32.7144 264.154 38.7046 270.145 46.1968 270.145H198.396C210.195 270.145 221.368 264.968 229.045 256.096C236.722 247.224 240.059 235.519 238.208 223.904L238.153 223.541C236.456 212.867 228.292 200.925 215.368 200.925H215.364C200.775 200.925 194.397 215.925 197.802 243.17Z"
        fill="#ABFE2C"
      />
    </svg>
  );
}

export function BaseIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
        fill="#0052FF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.79297 12.0002C5.79297 8.57429 8.57367 5.79297 12.0002 5.79297C14.8506 5.79297 17.2721 7.73223 17.9726 10.3706H22.2072C21.4563 5.95703 17.1803 2.625 12.0002 2.625C6.82531 2.625 2.625 6.82593 2.625 12.0002C2.625 17.1745 6.82531 21.3754 12.0002 21.3754C17.1803 21.3754 21.4563 18.0434 22.2072 13.6298H17.9726C17.2721 16.2682 14.8506 18.2075 12.0002 18.2075C8.57367 18.2075 5.79297 15.4262 5.79297 12.0002Z"
        fill="white"
      />
    </svg>
  );
}

export function EthereumIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
        fill="#627EEA"
      />
      <path
        d="M12.374 3V9.6525L17.9996 12.165L12.374 3Z"
        fill="white"
        fillOpacity="0.602"
      />
      <path d="M12.374 3L6.74838 12.165L12.374 9.6525V3Z" fill="white" />
      <path
        d="M12.374 16.4762V20.9964L18.0025 13.2122L12.374 16.4762Z"
        fill="white"
        fillOpacity="0.602"
      />
      <path
        d="M12.374 20.9964V16.4757L6.74838 13.2122L12.374 20.9964Z"
        fill="white"
      />
      <path
        d="M12.374 15.4298L17.9996 12.1652L12.374 9.65381V15.4298Z"
        fill="white"
        fillOpacity="0.2"
      />
      <path
        d="M6.74838 12.1652L12.374 15.4298V9.65381L6.74838 12.1652Z"
        fill="white"
        fillOpacity="0.602"
      />
    </svg>
  );
}

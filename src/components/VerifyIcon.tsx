import { FC, useState } from 'react';

export interface VerifyIconProps {
	className?: string;
	iconClass?: string;
}


const VerifyIcon: FC<VerifyIconProps> = ({
	className = 'ml-1',
	iconClass = 'w-4 h-4',
}) => {
	const [showTooltip, setShowTooltip] = useState(false);

	return (
		<span
			className={`relative inline-flex ${className}`}
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
			onFocus={() => setShowTooltip(true)} // Podrška za tastaturu
			onBlur={() => setShowTooltip(false)} // Podrška za tastaturu
			tabIndex={0} // Fokusabilno za tastaturu
			aria-describedby="tooltip" // Povezanost sa tooltipom za čitače ekrana
		>
			<svg className={iconClass} viewBox="0 0 17 17" fill="none">
				<path
					d="M7.66691 2.62178C8.12691 2.22845 8.88025 2.22845 9.34691 2.62178L10.4002 3.52845C10.6002 3.70178 10.9736 3.84178 11.2402 3.84178H12.3736C13.0802 3.84178 13.6602 4.42178 13.6602 5.12845V6.26178C13.6602 6.52178 13.8002 6.90178 13.9736 7.10178L14.8802 8.15512C15.2736 8.61512 15.2736 9.36845 14.8802 9.83512L13.9736 10.8884C13.8002 11.0884 13.6602 11.4618 13.6602 11.7284V12.8618C13.6602 13.5684 13.0802 14.1484 12.3736 14.1484H11.2402C10.9802 14.1484 10.6002 14.2884 10.4002 14.4618L9.34691 15.3684C8.88691 15.7618 8.13358 15.7618 7.66691 15.3684L6.61358 14.4618C6.41358 14.2884 6.04025 14.1484 5.77358 14.1484H4.62025C3.91358 14.1484 3.33358 13.5684 3.33358 12.8618V11.7218C3.33358 11.4618 3.19358 11.0884 3.02691 10.8884L2.12691 9.82845C1.74025 9.36845 1.74025 8.62178 2.12691 8.16178L3.02691 7.10178C3.19358 6.90178 3.33358 6.52845 3.33358 6.26845V5.12178C3.33358 4.41512 3.91358 3.83512 4.62025 3.83512H5.77358C6.03358 3.83512 6.41358 3.69512 6.61358 3.52178L7.66691 2.62178Z"
					fill="#38BDF8"
					stroke="#38BDF8"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M6.08691 8.98833L7.69358 10.6017L10.9136 7.375"
					stroke="white"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
			<div
				className={`absolute z-10 bg-[rgb(255,255,255)] rounded-xl border shadow-sm bg-card text-start text-neutral-900 transition-all duration-200 ease-in-out dark:text-neutral-200 px-2 py-1 pl-[8px] pr-[8px] pt-[8px] pb-[8px] ${
					showTooltip ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
				}`}
				style={{
					top: '-35px', // Razmak iznad ikone
					left: '50%',
					transform: 'translateX(-50%)',
					opacity: showTooltip ? 1 : 0,
					transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
				}}
			>
				<h2 className="text-sm font-medium leading-none tracking-tight">{'Verified'}</h2>
			</div>
		</span>
	);
};

export default VerifyIcon;

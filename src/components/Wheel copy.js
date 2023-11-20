import React, { useState, useEffect } from 'react';
import './Wheel.css';
import axios from 'axios';

const Wheel = () => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [currentDegree, setCurrentDegree] = useState(0);
    const [colors, setColors] = useState(['#06d6a0', '#00b4d8', '#ffbe0b', '#d62828']);
    const [prizes, setPrizes] = useState([]);
    const radius = 150;

    /* const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }; */

    useEffect(() => {
        /* const generatedColors = prizes.map(() => getRandomColor());
        setColors(['#06d6a0', '#00b4d8', '#ffbe0b', '#d62828']);
        setColors(generatedColors); */
        const fetchPrizes = async () => {
            try {
                const response = await axios.get('http://10.1.23.167:8090/api/v1/get-reward');
                // console.log(response.data.data);
                setPrizes(response.data.data);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu phần thưởng:', error);
            }
        };

        fetchPrizes();
    }, []);

    const spin = () => {
        const availablePrizes = prizes.filter(prize => prize.quantity > 0);

        if (availablePrizes.length === 0) {
            alert('Tất cả các phần thưởng đã được quay hết!');
            return;
        }

        const prizeIndex = Math.floor(Math.random() * availablePrizes.length);
        const selectedPrize = availablePrizes[prizeIndex];

        // Tính toán góc quay để chỉ vào phần thưởng được chọn
        const degreePerPrize = 360 / prizes.length;
        const finalDegree = prizes.indexOf(selectedPrize) * degreePerPrize;
        const totalSpin = finalDegree + 3600 - (currentDegree % 360);

        setCurrentDegree(totalSpin);
        setIsSpinning(true);

        setTimeout(async () => {
            setIsSpinning(false);

            const selectedPrize = prizes[prizeIndex].name;
            console.log(selectedPrize);
            try {
                const response = await axios.post('http://10.1.23.167:8090/api/v1/check-reward', { prizeName: selectedPrize });

                if (response.data.data.quantity > 0) {
                    alert(`Chúc mừng! Bạn đã trúng ${selectedPrize}`);
                } else {
                    alert(`Rất tiếc, phần thưởng ${selectedPrize} đã hết.`);
                }
            } catch (error) {
                console.error('Lỗi khi kiểm tra phần thưởng:', error);
            }

            /* prizes[prizeIndex].quantity -= 1;
            alert(`Bạn đã trúng ${prizes[prizeIndex].name}`);
            setPrizes([...prizes]);
            console.log(prizes); */
        }, 5000);
    };

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent) * radius;
        const y = Math.sin(2 * Math.PI * percent) * radius;
        return [radius + x, radius - y]; // Điều chỉnh vị trí tương đối với tâm của SVG
    };

    const wheelStyle = {
        transform: `rotate(${currentDegree}deg)`,
        transition: isSpinning ? 'transform 5s ease-out' : 'none',
    };

    // Function to get text coordinates for each prize
    const getTextCoordinates = (index) => {
        // Calculate the angle at the middle of the segment
        const angle = (index + 0.5) * (360 / prizes.length);
        // Convert that angle to radians
        const angleRad = (Math.PI / 180) * angle;
        // Calculate the text position
        const textRadius = radius * 0.7; // Text positioned closer to the center of the wheel
        const x = radius + (textRadius * Math.cos(angleRad));
        const y = radius - (textRadius * Math.sin(angleRad));
        return [x, y];
    };

    // Function to rotate text so it appears upright
    const getTextRotation = (index) => {
        // Each segment covers an arc of the following angle:
        const arcAngle = 360 / prizes.length;
        // We need to rotate the text by half of that arc to align it properly
        const rotateAngle = (arcAngle * index) + (arcAngle / 2);
        return -rotateAngle;
    };

    return (
        <div>
            <div className="wheel-container">
                <svg
                    width={radius * 2}
                    height={radius * 2}
                    viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                    style={wheelStyle}
                    className="wheel"
                >
                    <circle cx={radius} cy={radius} r={radius} fill="#fff" />
                    {prizes.map((prize, index) => {
                        const [startX, startY] = getCoordinatesForPercent(index / prizes.length);
                        const [endX, endY] = getCoordinatesForPercent((index + 1) / prizes.length);
                        const pathData = [
                            `M ${radius},${radius}`, // Di chuyển đến tâm
                            `L ${startX},${startY}`, // Vẽ đường thẳng từ tâm đến điểm bắt đầu
                            `A ${radius},${radius} 0 0,0 ${endX},${endY}`, // Vẽ cung tròn từ điểm bắt đầu đến điểm kết thúc
                            'Z' // Đóng đường dẫn
                        ].join(' ');

                        // Calculate text coordinates
                        const [textX, textY] = getTextCoordinates(index);
                        // Adjust text rotation so that it's upright
                        const textRotation = getTextRotation(index);

                        return (
                            <g key={index}>
                                <path d={pathData} fill={colors[index]} />
                                <text
                                    x={textX}
                                    y={textY}
                                    fill="black"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize={`${radius / prizes.length * 0.9}px`}
                                    transform={`rotate(${textRotation},${textX},${textY})`}
                                >
                                    {prize.name}
                                </text>
                            </g>
                        );
                    })}
                    <circle cx="150" cy="150" r="20" fill="white" />
                    <circle cx="150" cy="150" r="10" fill="green" />
                </svg>
                <svg
                    width={radius * 2}
                    height={radius * 2}
                    viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                    className="arrow"
                    style={{ position: 'absolute', transform: 'translate(-12%, -12%) rotate(90deg)' }}
                >
                    {/* Mũi tên cố định hướng lên góc 3 giờ */}
                    <polygon
                        points={`150,70 140,110 160,100`}
                        fill="green"
                    />
                </svg>
                <button onClick={spin} className="spin-button" disabled={isSpinning}>Start</button>
            </div>
        </div>
    );
};

export default Wheel;

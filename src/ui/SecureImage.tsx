import { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

// Direct import to avoid circular dependencies or weird export issues
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const StyledImage = styled.img<{ $isLoading: boolean }>`
  transition: opacity 0.3s ease;
  opacity: ${({ $isLoading }) => ($isLoading ? 0.5 : 1)};
`;

type SecureImageProps = {
    src?: string;
    alt?: string;
    className?: string; // Allow passing styled-component class names
    fallbackSrc?: string;
    style?: React.CSSProperties;
};

export default function SecureImage({
    src,
    alt,
    className,
    fallbackSrc = "/default-user.jpg",
    style,
}: SecureImageProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        // 1. Handle empty/local/data URLs immediately
        if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
            setBlobUrl(src || fallbackSrc);
            setIsLoading(false);
            return;
        }

        // 2. Handle static assets (starting with / but NOT /api/)
        // Allows implicit public folder access for /default-user.jpg etc.
        if (src.startsWith("/") && !src.startsWith("/api/")) {
            setBlobUrl(src);
            setIsLoading(false);
            return;
        }

        let active = true;
        setIsLoading(true);
        setHasError(false);

        // 3. Construct URL
        // If src is relative (/api/v1/...), prepend base URL
        let fullUrl = src;
        if (src.startsWith('/')) {
            // Ensure strictly one slash between base and path
            const base = API_BASE_URL.replace(/\/+$/, '');
            const path = src.replace(/^\/+/, '');
            fullUrl = `${base}/${path}`;
        }

        // 4. Get Token
        const token = localStorage.getItem('token');

        // 5. Append Query Param as Fallback (Double Security)
        if (token) {
            const separator = fullUrl.includes('?') ? '&' : '?';
            fullUrl = `${fullUrl}${separator}token=${token}`;
        }

        // 6. Fetch with Axios
        console.debug(`[SecureImage] Fetching: ${fullUrl}`);
        axios.get(fullUrl, {
            responseType: "blob",
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
            .then((response) => {
                if (active) {
                    const url = URL.createObjectURL(response.data);
                    setBlobUrl(url);
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                console.error(`[SecureImage] Error fetching ${fullUrl}:`, err);
                if (active) {
                    setHasError(true);
                    setBlobUrl(fallbackSrc);
                    setIsLoading(false);
                }
            });

        return () => {
            active = false;
            if (blobUrl && blobUrl.startsWith("blob:")) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [src, fallbackSrc]);

    if (hasError || !blobUrl) {
        return (
            <img
                src={fallbackSrc}
                alt={alt}
                className={className}
                style={style}
            />
        )
    }

    return (
        <StyledImage
            src={blobUrl}
            alt={alt}
            className={className}
            $isLoading={isLoading}
            style={style}
        />
    );
}

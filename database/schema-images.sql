-- =============================================
-- PRODUCTIVEAPP - STRUCTURE IMAGES
-- Table pour référencer toutes les images de l'app
-- =============================================

CREATE TABLE IF NOT EXISTS app_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'avatar', 'icon', 'logo', 'decoration'
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    width INTEGER,
    height INTEGER,
    file_size INTEGER, -- Taille en bytes
    mime_type VARCHAR(100), -- image/png, image/jpeg, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_file_path UNIQUE (file_path)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_images_category ON app_images(category);
CREATE INDEX IF NOT EXISTS idx_images_name ON app_images(name);

-- Insertion des images existantes
INSERT INTO app_images (name, category, file_path, description, width, height, file_size, mime_type) VALUES
    (
        'Maître Maha Giri',
        'avatar',
        'assets/images/avatars/maha-giri-master.jpg',
        'Photo spirituelle du Maître Maha Giri - Effet divin sur écran de connexion avec glow et rayons',
        800,
        1200,
        134980,
        'image/jpeg'
    ),
    (
        'Œil d''Horus',
        'icon',
        'assets/images/icons/eye-of-horus.png',
        'Icône sacrée pour accès Galaxy View - Particules dorées divines au hover',
        512,
        512,
        NULL, -- À remplir après upload
        'image/png'
    ),
    (
        'Menu Icon',
        'icon',
        'assets/images/icons/menu-icon.png',
        'Icône du menu hamburger premium avec effet glow',
        256,
        256,
        198656,
        'image/png'
    )
ON CONFLICT (file_path) DO NOTHING;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_app_images_updated_at
    BEFORE UPDATE ON app_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires sur la table
COMMENT ON TABLE app_images IS 'Catalogue de toutes les images utilisées dans ProductiveApp avec métadonnées';
COMMENT ON COLUMN app_images.category IS 'Catégorie: avatar (visages/personnes), icon (icônes UI), logo (logos app), decoration (éléments décoratifs)';
COMMENT ON COLUMN app_images.file_path IS 'Chemin relatif depuis la racine du projet';
COMMENT ON COLUMN app_images.width IS 'Largeur en pixels';
COMMENT ON COLUMN app_images.height IS 'Hauteur en pixels';
COMMENT ON COLUMN app_images.file_size IS 'Taille du fichier en bytes';

-- Vue pour statistiques rapides
CREATE OR REPLACE VIEW images_stats AS
SELECT
    category,
    COUNT(*) as count,
    SUM(file_size) as total_size,
    AVG(width) as avg_width,
    AVG(height) as avg_height
FROM app_images
GROUP BY category;

COMMENT ON VIEW images_stats IS 'Statistiques sur les images par catégorie';

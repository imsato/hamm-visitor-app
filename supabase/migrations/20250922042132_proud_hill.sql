/*
  # 駐車情報フィールドの追加

  1. 新しいカラム
    - `has_parking` (boolean) - 駐車有無
    - `vehicle_number` (text) - 車両ナンバー（最大10文字）

  2. 変更内容
    - visitorsテーブルに駐車関連の2つのカラムを追加
    - has_parkingはデフォルトでfalse
    - vehicle_numberは任意項目（NULL許可）
*/

-- 駐車有無フィールドを追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'visitors' AND column_name = 'has_parking'
  ) THEN
    ALTER TABLE visitors ADD COLUMN has_parking boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- 車両ナンバーフィールドを追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'visitors' AND column_name = 'vehicle_number'
  ) THEN
    ALTER TABLE visitors ADD COLUMN vehicle_number text;
  END IF;
END $$;

-- 車両ナンバーの文字数制限を追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'visitors_vehicle_number_length_check'
  ) THEN
    ALTER TABLE visitors ADD CONSTRAINT visitors_vehicle_number_length_check 
    CHECK (vehicle_number IS NULL OR length(vehicle_number) <= 10);
  END IF;
END $$;
import "./FileCard.css";
import deleteIcon from "../../assets/delete.png";
import editIcon from "../../assets/edit.png";
import musicIcon from "../../assets/music.png";
import photoIcon from "../../assets/photo.png";
import videoIcon from "../../assets/video.png";
import fileIcon from "../../assets/file.png";
import gifIcon from "../../assets/gif.png";
import svgIcon from "../../assets/svg.png";

const getFileIcon = (fileName) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  const icons = {
    // Documents
    pdf: fileIcon,
    doc: fileIcon,
    docx: fileIcon,
    txt: fileIcon,

    // Spreadsheets & Data
    csv: fileIcon,
    xls: fileIcon,
    xlsx: fileIcon,
    json: fileIcon,

    // Media
    jpg: photoIcon,
    jpeg: photoIcon,
    png: photoIcon,
    gif: gifIcon,
    webp: photoIcon,
    svg: svgIcon,

    // Audio / Video
    mp3: musicIcon,
    wav: musicIcon,
    mp4: videoIcon,
    mov: videoIcon,
    mkv: videoIcon,

    // Archives & Code
    zip: fileIcon,
    rar: fileIcon,
    js: fileIcon,
    html: fileIcon,
    css: fileIcon,
  };

  // Return PNG fallback instead of emoji string "📄"
  return icons[extension] || fileIcon;
};

const FileCard = ({ id, fileName, baseUrl, onRename, onDelete }) => {
  const iconSrc = getFileIcon(fileName);

  return (
    <div className="file-card">
      <div className="file-card__header">
        <div className="file-card__icon">
          {/* Render imported PNG using <img> */}
          <img src={iconSrc} alt={`${fileName} icon`} width={40} height={40} />
        </div>

        <div className="file-card__actions">
          <button
            type="button"
            onClick={() => onRename(id, fileName)}
            aria-label={`Rename ${fileName}`}
            title="Rename"
          >
            <img src={editIcon} alt="edit icon" width={18} height={18} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(id)}
            aria-label={`Delete ${fileName}`}
            title="Delete"
          >
            <img src={deleteIcon} alt="delete icon" width={20} height={20} />
          </button>
        </div>
      </div>

      <div className="file-card__info">
        <span className="file-card__name" title={fileName}>
          {fileName}
        </span>

        <span className="file-card__type">File</span>
      </div>

      <div className="file-card__links">
        <a href={`${baseUrl}/files/${id}`} target="_blank" rel="noreferrer">
          Open
        </a>

        <a href={`${baseUrl}/files/${id}?action=download`}>Download</a>
      </div>
    </div>
  );
};

export default FileCard;

import deleteIcon from "../../assets/delete.png";
import editIcon from "../../assets/edit.png";
import folderIcon from "../../assets/folder.png";
import "./FolderCard.css";

const FolderCard = ({ id, folderName, onOpen, onRename, onDelete }) => {
  return (
    <div className="folder-card">
      <button
        className="folder-card__main"
        onClick={() => onOpen(id)}
        type="button"
      >
        <div className="folder-card__icon">
          {/* Render imported PNG using <img> */}
          <img src={folderIcon} alt="folder icon" width={40} height={40} />
        </div>

        <div className="folder-card__info">
          <span className="folder-card__name">{folderName}</span>
          <span className="folder-card__type">Folder</span>
        </div>
      </button>

      <div className="folder-card__actions">
        <button
          type="button"
          onClick={() => onRename(id, folderName)}
          aria-label={`Rename ${folderName}`}
          title="Rename"
        >
          {/* Fixed alt attribute to match the edit action */}
          <img src={editIcon} alt="edit icon" width={18} height={18} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(id)}
          aria-label={`Delete ${folderName}`}
          title="Delete"
        >
          <img src={deleteIcon} alt="delete icon" width={20} height={20} />
        </button>
      </div>
    </div>
  );
};

export default FolderCard;

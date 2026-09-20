import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";

import FolderCard from "../FolderCard/FolderCard";
import FileCard from "../FileCard/FileCard";
import ProfileMenu from "../ProfileMenu/ProfileMenu";

import "./Dashboard.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [filesList, setFilesList] = useState([]);
  const [foldersList, setFoldersList] = useState([]);

  const [progress, setProgress] = useState("0");
  const [showProgress, setShowProgress] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);

  const [createFolderName, setCreateFolderName] = useState("");
  const [folderName, setFolderName] = useState("");

  const [renameFolderName, setRenameFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");

  const [renameTarget, setRenameTarget] = useState(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const fileInputRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { folderId } = useParams();

  useEffect(() => {
    fetchData();
  }, [folderId]);

  async function fetchData() {
    try {
      const res = await fetch(`${BASE_URL}/folder/${folderId || ""}`, {
        credentials: "include",
      });

      if (!res.ok) {
        console.error(
          `Failed to fetch folder: ${res.status} ${res.statusText}`,
        );
        if (res.status === 401) {
          navigate("/login");
        }
        return;
      }

      const data = await res.json();
      setFolderName(data.name);
      setFilesList(data.files || []);
      setFoldersList(data.folders || []);

      setNewFileName("");
      setRenameFolderName("");
      setRenameTarget(null);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];

    if (!file) return;

    setShowProgress(true);
    setProgress("0");

    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${BASE_URL}/files/${folderId || ""}`, true);
    xhr.withCredentials = true;

    xhr.setRequestHeader("filename", file.name);

    xhr.addEventListener("load", () => {
      setShowProgress(false);
      setShowSuccessMsg(true);

      setTimeout(() => {
        setShowSuccessMsg(false);
      }, 2000);

      fetchData();
    });

    xhr.addEventListener("error", () => {
      setShowProgress(false);
      console.error("File upload failed");
    });

    xhr.upload.addEventListener("progress", (e) => {
      if (!e.lengthComputable) return;

      const totalProgress = (e.loaded / e.total) * 100;
      setProgress(totalProgress.toFixed(1));
    });

    xhr.send(file);

    e.target.value = "";
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileDelete(fileId) {
    try {
      const res = await fetch(`${BASE_URL}/files/${fileId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("File delete failed");
        return;
      }
      fetchData();
    } catch (err) {
      console.error("File delete failed:", err);
    }
  }

  async function handleFolderDelete(folderIdToDelete) {
    try {
      const res = await fetch(`${BASE_URL}/folder/${folderIdToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Folder delete failed");
        return;
      }

      // If the folder being deleted is the folder
      // we're currently inside, go back to its parent.
      if (folderIdToDelete === folderId) {
        navigate("/");
        return;
      }

      fetchData();
    } catch (err) {
      console.error("Folder delete failed:", err);
    }
  }

  async function handleFolderCreation() {
    if (!createFolderName.trim()) return;

    try {
      const res = await fetch(`${BASE_URL}/folder/${folderId || ""}`, {
        method: "POST",
        headers: {
          folderName: createFolderName.trim(),
        },
        credentials: "include",
      });

      if (res.ok) {
        setCreateFolderName("");
        setShowCreateFolder(false);
        fetchData();
      }
    } catch (err) {
      console.error("Folder creation failed:", err);
    }
  }

  async function handleFileRename(fileId) {
    if (!newFileName.trim()) return;

    try {
      const res = await fetch(`${BASE_URL}/files/${fileId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newFileName: newFileName.trim(),
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setRenameTarget(null);
        setNewFileName("");
        fetchData();
      } else {
        console.error("Rename failed:", data);
      }
    } catch (err) {
      console.error("File rename failed:", err);
    }
  }

  async function handleFolderRename(folderIdToRename) {
    if (!renameFolderName.trim()) return;

    try {
      const res = await fetch(`${BASE_URL}/folder/${folderIdToRename}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newFolderName: renameFolderName.trim(),
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setRenameTarget(null);
        setRenameFolderName("");
        fetchData();
      } else {
        console.error("Rename failed:", data);
      }
    } catch (err) {
      console.error("Folder rename failed:", err);
    }
  }

  function handleFolderOpen(id) {
    navigate(`/folder/${id}`);
  }

  function handleFolderRenameStart(id, folderName) {
    setRenameTarget({
      id,
      type: "folder",
    });

    setRenameFolderName(folderName);
  }

  function handleFileRenameStart(id, fileName) {
    setRenameTarget({
      id,
      type: "file",
    });

    setNewFileName(fileName);
  }

  function closeRename() {
    setRenameTarget(null);
    setNewFileName("");
    setRenameFolderName("");
  }

  const currentFolderName = location.pathname === "/" ? "My Files" : folderName;

  const hasItems = foldersList.length > 0 || filesList.length > 0;

  return (
    <div className="dashboard">
      <header className="dashboard__navbar">
        <Link to="/" className="dashboard__brand">
          <span className="dashboard__brand-icon">☁</span>
          <span>cloudpockets</span>
        </Link>

        <div className="dashboard__navbar-actions">
          <button
            type="button"
            className="dashboard__nav-button dashboard__nav-button--folder"
            onClick={() => setShowCreateFolder(true)}
          >
            <span>＋</span>
            New Folder
          </button>

          <button
            type="button"
            className="dashboard__nav-button dashboard__nav-button--upload"
            onClick={handleUploadClick}
          >
            <span>↑</span>
            Upload
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="dashboard__file-input"
            onChange={handleFileUpload}
          />

          <ProfileMenu />
        </div>
      </header>

      <main className="dashboard__content">
        <div className="dashboard__heading">
          <div>
            <p className="dashboard__eyebrow">Storage</p>

            <h1 className="dashboard__title">{currentFolderName}</h1>
          </div>

          {showProgress && (
            <div className="dashboard__upload-progress">
              <div className="dashboard__progress-top">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>

              <div className="dashboard__progress-track">
                <div
                  className="dashboard__progress-bar"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          )}

          {showSuccessMsg && (
            <div className="dashboard__success">
              ✓ File uploaded successfully
            </div>
          )}
        </div>

        {hasItems ? (
          <section className="dashboard__grid">
            {foldersList.map(({ id, name }) => (
              <FolderCard
                key={`folder-${id}`}
                id={id}
                folderName={name}
                onOpen={handleFolderOpen}
                onRename={handleFolderRenameStart}
                onDelete={handleFolderDelete}
              />
            ))}

            {filesList.map(({ id, name }) => (
              <FileCard
                key={`file-${id}`}
                id={id}
                fileName={name}
                baseUrl={BASE_URL}
                onRename={handleFileRenameStart}
                onDelete={handleFileDelete}
              />
            ))}
          </section>
        ) : (
          <section className="dashboard__empty">
            <div className="dashboard__empty-icon">☁</div>

            <h2>Your storage is empty</h2>

            <p>Upload a file or create a folder to get started.</p>

            <div className="dashboard__empty-actions">
              <button type="button" onClick={handleUploadClick}>
                ↑ Upload a file
              </button>

              <button type="button" onClick={() => setShowCreateFolder(true)}>
                ＋ Create folder
              </button>
            </div>
          </section>
        )}
      </main>

      {showCreateFolder && (
        <div
          className="dashboard__modal-backdrop"
          onClick={() => setShowCreateFolder(false)}
        >
          <div
            className="dashboard__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dashboard__modal-header">
              <div>
                <p className="dashboard__eyebrow">New folder</p>

                <h2>Create a folder</h2>
              </div>

              <button
                type="button"
                className="dashboard__modal-close"
                onClick={() => setShowCreateFolder(false)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFolderCreation();
              }}
            >
              <label htmlFor="folder-name">Folder name</label>

              <input
                id="folder-name"
                type="text"
                placeholder="e.g. Projects"
                value={createFolderName}
                onChange={(e) => setCreateFolderName(e.target.value)}
                autoFocus
              />

              <div className="dashboard__modal-actions">
                <button
                  type="button"
                  className="dashboard__modal-cancel"
                  onClick={() => {
                    setShowCreateFolder(false);
                    setCreateFolderName("");
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="dashboard__modal-create">
                  Create folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {renameTarget && (
        <div className="dashboard__modal-backdrop" onClick={closeRename}>
          <div
            className="dashboard__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dashboard__modal-header">
              <div>
                <p className="dashboard__eyebrow">Rename</p>

                <h2>
                  {renameTarget.type === "file"
                    ? "Rename file"
                    : "Rename folder"}
                </h2>
              </div>

              <button
                type="button"
                className="dashboard__modal-close"
                onClick={closeRename}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (renameTarget.type === "file") {
                  handleFileRename(renameTarget.id);
                } else {
                  handleFolderRename(renameTarget.id);
                }
              }}
            >
              <label htmlFor="rename-input">New name</label>

              <input
                id="rename-input"
                type="text"
                value={
                  renameTarget.type === "file" ? newFileName : renameFolderName
                }
                onChange={(e) => {
                  if (renameTarget.type === "file") {
                    setNewFileName(e.target.value);
                  } else {
                    setRenameFolderName(e.target.value);
                  }
                }}
                autoFocus
              />

              <div className="dashboard__modal-actions">
                <button
                  type="button"
                  className="dashboard__modal-cancel"
                  onClick={closeRename}
                >
                  Cancel
                </button>

                <button type="submit" className="dashboard__modal-create">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
